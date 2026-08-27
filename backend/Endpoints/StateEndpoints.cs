using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Pomo.Auth;
using Pomo.Data;
using Pomo.Data.Entities;
using Pomo.Dtos;

namespace Pomo.Endpoints;

public static class StateEndpoints
{
    /// <summary>Longest run we'll accept as a high score or baseline: 12 hours.</summary>
    private const int MaxRunSeconds = 12 * 60 * 60;

    /// <summary>Matches the client's Break Limit ceiling of 60 minutes.</summary>
    private const int MaxBreakSeconds = 60 * 60;

    /// <summary>Settings is a small preferences bag; anything larger is a mistake or an attack.</summary>
    private const int MaxSettingsBytes = 16 * 1024;

    public static void MapStateEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/state").WithTags("State");

        group.MapGet("/", GetState).WithName("GetPlayerState");
        group.MapPut("/", UpdateState).WithName("UpdatePlayerState");
    }

    /// <summary>
    /// Loads the caller's progress, creating it with the starting grant if this is
    /// their first visit — a new player should get a playable account, not a 404.
    /// </summary>
    private static async Task<IResult> GetState(
        PomoDbContext db,
        ICurrentUser currentUser,
        CancellationToken ct)
    {
        var userId = await currentUser.GetIdAsync(ct);
        var state = await db.PlayerStates.FirstOrDefaultAsync(s => s.UserId == userId, ct);

        if (state is null)
        {
            state = new PlayerState { UserId = userId };
            db.PlayerStates.Add(state);
            await db.SaveChangesAsync(ct);
        }

        var buildings = await db.Buildings
            .Where(x => x.UserId == userId)
            .OrderBy(x => x.BuiltAt)
            .ToListAsync(ct);

        return Results.Ok(ToResponse(state, buildings));
    }

    /// <summary>
    /// Saves the caller's progress.
    /// </summary>
    /// <remarks>
    /// Currency is currently accepted from the client, because the earning-authority
    /// question is still open (backlog card 3). That means a determined player can
    /// edit their own balance. If you decide the server owns earning, currency
    /// fields here become read-only and payouts move to POST /api/cycles
    /// (cards 19-21).
    ///
    /// Range validation applies regardless — it costs nothing and stops a typo or
    /// a bad merge from persisting a negative balance or a 40-hour focus target.
    /// </remarks>
    private static async Task<IResult> UpdateState(
        UpdatePlayerStateRequest req,
        PomoDbContext db,
        ICurrentUser currentUser,
        CancellationToken ct)
    {
        if (Validate(req) is { } error)
        {
            return Results.ValidationProblem(error);
        }

        var userId = await currentUser.GetIdAsync(ct);
        var state = await db.PlayerStates.FirstOrDefaultAsync(s => s.UserId == userId, ct);

        if (state is null)
        {
            state = new PlayerState { UserId = userId };
            db.PlayerStates.Add(state);
        }
        else if (req.Version is { } clientVersion && clientVersion != state.Version)
        {
            /*
              Another device wrote since this client last read. Refuse rather than
              overwrite, and hand back the current state so the client can merge
              instead of making a second round trip.
            */
            var current = await db.Buildings
                .Where(x => x.UserId == userId)
                .OrderBy(x => x.BuiltAt)
                .ToListAsync(ct);

            return Results.Json(
                new ConflictResponse
                {
                    Message =
                        "This account was updated on another device. Merge with "
                        + "`current` and retry.",
                    Current = ToResponse(state, current),
                },
                statusCode: StatusCodes.Status409Conflict);
        }

        if (req.Coins is { } coins) state.Coins = coins;
        if (req.Keys is { } keys) state.Keys = keys;
        if (req.Cycle is { } cycle) state.Cycle = cycle;
        if (req.FocusTarget is { } focus) state.FocusTargetSeconds = focus;
        if (req.BreakLimit is { } brk) state.BreakLimitSeconds = brk;
        if (req.Mode is { } mode) state.Mode = mode;
        if (req.TotalMinutes is { } total) state.TotalMinutes = total;
        if (req.Settings is { } settings) state.Settings = settings.GetRawText();

        /*
          High score and baseline only ever move in one direction. Taking the max
          means a stale client can't lower them, which is the common case when two
          devices sync out of order.
        */
        if (req.HighScore is { } high)
        {
            state.HighScoreSeconds = Math.Max(state.HighScoreSeconds, high);
        }

        /*
          Baseline is a measurement, not a record, so max() would be wrong here —
          a recalibrated baseline is legitimately allowed to come out lower than
          the old one. The rule is the one the client implements: the first Auto
          run you finish sets it, recalibrating clears it, and nothing else moves
          it.

          Note this will need revisiting for intra-day adaptation (backlog card
          31), where the baseline is expected to drift down over the course of a
          day rather than being set once.
        */
        if (req.Baseline is { } baseline)
        {
            if (baseline == 0)
            {
                // Recalibrate: clear it so the next Auto run measures fresh.
                state.BaselineSeconds = 0;
            }
            else if (state.BaselineSeconds == 0)
            {
                // First measurement wins.
                state.BaselineSeconds = baseline;
            }
            // Already measured: ignore. GET returns the truth so the client reconciles.
        }

        state.UpdatedAt = DateTimeOffset.UtcNow;

        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateConcurrencyException)
        {
            // Lost a genuine race between our read and our write.
            return Results.Json(
                new { error = "version_conflict", message = "Concurrent write; retry." },
                statusCode: StatusCodes.Status409Conflict);
        }

        var houses = await db.Buildings
            .Where(x => x.UserId == userId)
            .OrderBy(x => x.BuiltAt)
            .ToListAsync(ct);

        return Results.Ok(ToResponse(state, houses));
    }

    private static Dictionary<string, string[]>? Validate(UpdatePlayerStateRequest r)
    {
        var errors = new Dictionary<string, string[]>();

        void Bad(string field, string message) => errors[field] = [message];

        if (r.Coins is < 0) Bad(nameof(r.Coins), "Cannot be negative.");
        if (r.Keys is < 0) Bad(nameof(r.Keys), "Cannot be negative.");
        if (r.Cycle is < 1) Bad(nameof(r.Cycle), "Must be at least 1.");
        if (r.TotalMinutes is < 0) Bad(nameof(r.TotalMinutes), "Cannot be negative.");

        if (r.HighScore is { } h && (h < 0 || h > MaxRunSeconds))
            Bad(nameof(r.HighScore), $"Must be between 0 and {MaxRunSeconds} seconds.");

        if (r.Baseline is { } b && (b < 0 || b > MaxRunSeconds))
            Bad(nameof(r.Baseline), $"Must be between 0 and {MaxRunSeconds} seconds.");

        if (r.FocusTarget is { } f && (f < 60 || f > MaxRunSeconds))
            Bad(nameof(r.FocusTarget), $"Must be between 60 and {MaxRunSeconds} seconds.");

        if (r.BreakLimit is { } k && (k < 0 || k > MaxBreakSeconds))
            Bad(nameof(r.BreakLimit), $"Must be between 0 and {MaxBreakSeconds} seconds.");

        if (r.Mode is { } m && m is not ("auto" or "manual"))
            Bad(nameof(r.Mode), "Must be \"auto\" or \"manual\".");

        if (r.Settings is { } s)
        {
            if (s.ValueKind != JsonValueKind.Object)
                Bad(nameof(r.Settings), "Must be a JSON object.");
            else if (s.GetRawText().Length > MaxSettingsBytes)
                Bad(nameof(r.Settings), $"Must be under {MaxSettingsBytes} bytes.");
        }

        return errors.Count > 0 ? errors : null;
    }

    private static PlayerStateResponse ToResponse(
        PlayerState s,
        IReadOnlyList<Building> buildings) => new()
        {
            Coins = s.Coins,
            Keys = s.Keys,
            Cycle = s.Cycle,
            HighScore = s.HighScoreSeconds,
            Baseline = s.BaselineSeconds,
            FocusTarget = s.FocusTargetSeconds,
            BreakLimit = s.BreakLimitSeconds,
            Mode = s.Mode,
            TotalMinutes = s.TotalMinutes,
            Settings = JsonDocument.Parse(s.Settings).RootElement.Clone(),
            Version = s.Version,
            Houses = [.. buildings.Select(b => new BuildingResponse
            {
                Id = b.Id.ToString(),
                KindId = b.KindId,
                Name = b.Name,
                Gx = b.GridX,
                Gy = b.GridY,
                BuiltAt = b.BuiltAt.ToUnixTimeMilliseconds(),
                BuiltAfterMinutes = b.BuiltAfterMinutes,
            })],
        };
}
