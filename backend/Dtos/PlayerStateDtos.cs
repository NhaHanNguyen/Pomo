using System.Text.Json;
using System.Text.Json.Serialization;

namespace Pomo.Dtos;

/// <summary>
/// A player's progress, shaped to match <c>GameState</c> in
/// <c>frontend/src/types.ts</c> so the reducer can hydrate without reshaping.
/// </summary>
/// <remarks>
/// Times are seconds, matching the client. The transient fields (<c>phase</c>,
/// <c>elapsed</c>, <c>breakRemaining</c>, <c>cycleCoins</c>, <c>lastCycle</c>)
/// are deliberately absent — they describe a run in flight and must not survive
/// a reload, or a refresh would silently keep counting minutes nobody focused.
/// </remarks>
public record PlayerStateResponse
{
    public long Coins { get; init; }
    public int Keys { get; init; }
    public int Cycle { get; init; }

    /// <summary>Longest completed run. 0 means never set; the UI shows "--:--".</summary>
    public int HighScore { get; init; }

    /// <summary>Measured from the first finished Auto run. 0 means not yet calibrated.</summary>
    public int Baseline { get; init; }

    public int FocusTarget { get; init; }
    public int BreakLimit { get; init; }

    /// <summary>"auto" or "manual".</summary>
    public required string Mode { get; init; }

    public int TotalMinutes { get; init; }

    public JsonElement Settings { get; init; }

    /// <summary>
    /// Optimistic concurrency token. Send it back on PUT; a mismatch means another
    /// device wrote first and you get a 409 instead of silently clobbering it.
    /// </summary>
    public long Version { get; init; }

    /// <summary>
    /// The player's city, included so the client can hydrate in one call. Writes
    /// go through the dedicated city endpoints (backlog cards 25-26), not here.
    /// </summary>
    public IReadOnlyList<BuildingResponse> Houses { get; init; } = [];
}

public record BuildingResponse
{
    public required string Id { get; init; }
    public required string KindId { get; init; }
    public required string Name { get; init; }
    public int Gx { get; init; }
    public int Gy { get; init; }
    public long BuiltAt { get; init; }
    public int BuiltAfterMinutes { get; init; }
}

/// <summary>
/// A save. Every field is optional so the client can send partial updates —
/// changing the break limit shouldn't require echoing the whole object back.
/// </summary>
public record UpdatePlayerStateRequest
{
    public long? Coins { get; init; }
    public int? Keys { get; init; }
    public int? Cycle { get; init; }
    public int? HighScore { get; init; }
    public int? Baseline { get; init; }
    public int? FocusTarget { get; init; }
    public int? BreakLimit { get; init; }
    public string? Mode { get; init; }
    public int? TotalMinutes { get; init; }
    public JsonElement? Settings { get; init; }

    /// <summary>
    /// The version this client last read. Omit to force the write through and
    /// accept last-write-wins.
    /// </summary>
    public long? Version { get; init; }
}

/// <summary>Returned on a 409 so the client can reconcile rather than guess.</summary>
public record ConflictResponse
{
    [JsonPropertyName("error")]
    public string Error { get; init; } = "version_conflict";

    public required string Message { get; init; }

    /// <summary>The server's current state, so the client can merge without a re-fetch.</summary>
    public required PlayerStateResponse Current { get; init; }
}
