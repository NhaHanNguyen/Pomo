namespace Pomo.Data.Entities;

/// <summary>
/// A player's persistent progress — one row per user.
/// </summary>
/// <remarks>
/// Mirrors the durable half of <c>GameState</c> in
/// <c>frontend/src/types.ts</c>. The transient fields are deliberately absent:
/// <c>phase</c>, <c>elapsed</c>, <c>breakRemaining</c>, <c>cycleCoins</c> and
/// <c>lastCycle</c> describe a run in flight, and the client already refuses to
/// restore a running timer on reload — a refresh shouldn't silently keep
/// counting minutes nobody focused.
///
/// Currency and progression get real columns so they stay queryable for stats and
/// any future leaderboard. Settings is a single JSON document, because it's a
/// grab-bag that changes shape often and nothing needs to query inside it.
/// </remarks>
public class PlayerState
{
    public Guid UserId { get; set; }
    public User? User { get; set; }

    /// <summary>
    /// Starting grant is 3000 coins and 1 key — exactly one Small House, so a new
    /// player can place a building and see what the city is for before grinding.
    /// </summary>
    public long Coins { get; set; } = 3000;

    public int Keys { get; set; } = 1;

    public int Cycle { get; set; } = 1;

    /// <summary>Longest single completed run, in seconds. 0 means never set.</summary>
    public int HighScoreSeconds { get; set; }

    /// <summary>
    /// Measured, never typed: the first Auto run a player finishes establishes it.
    /// 0 means not yet calibrated, which the UI shows as "--:--".
    /// </summary>
    public int BaselineSeconds { get; set; }

    /// <summary>Manual-mode countdown target, in seconds.</summary>
    public int FocusTargetSeconds { get; set; } = 25 * 60;

    public int BreakLimitSeconds { get; set; } = 5 * 60;

    /// <summary>"auto" or "manual". Manual is the default — the gentler landing spot.</summary>
    public string Mode { get; set; } = "manual";

    /// <summary>All-time minutes focused, used for building history.</summary>
    public int TotalMinutes { get; set; }

    /// <summary>
    /// The client's settings object, stored as jsonb. Includes blockedWebsites,
    /// volumes, autoStart flags and longBreakInterval.
    /// </summary>
    public string Settings { get; set; } = "{}";

    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Concurrency token. Two devices finishing cycles at once would otherwise
    /// last-write-wins away one device's progress (backlog card 17).
    /// </summary>
    public uint Version { get; set; }
}
