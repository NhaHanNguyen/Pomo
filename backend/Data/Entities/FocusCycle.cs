namespace Pomo.Data.Entities;

/// <summary>
/// One focus session, completed or abandoned.
/// </summary>
/// <remarks>
/// This table is the foundation for three separate things that don't exist yet,
/// which is why it's worth creating before any of them: session history and
/// stats, streaks, and — most importantly — the intra-day baseline adaptation
/// the wiki calls the key innovation ("attention spans are not stable throughout
/// a day"). None of that can be backfilled from data you never captured.
/// </remarks>
public class FocusCycle
{
    public Guid Id { get; set; } = Guid.CreateVersion7();

    public Guid UserId { get; set; }
    public User? User { get; set; }

    /// <summary>"auto" or "manual". Only Auto runs establish a baseline.</summary>
    public required string Mode { get; set; }

    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset EndedAt { get; set; }

    /// <summary>Seconds actually focused, excluding paused time.</summary>
    public int ElapsedSeconds { get; set; }

    /// <summary>
    /// The player's UTC offset in minutes at the time of the run. Needed because
    /// "how does focus vary across my day" and "did I keep my streak" are both
    /// questions about local time, not UTC.
    /// </summary>
    public int TimeZoneOffsetMinutes { get; set; }

    /// <summary>Coins from focusing, credited second by second at the tiered rate.</summary>
    public long FocusCoins { get; set; }

    /// <summary>
    /// Coins the city paid. Zero on runs under the payout floor — buildings pay
    /// per cycle, so without a minimum length a big city could be farmed by
    /// spamming ten-second sessions.
    /// </summary>
    public long CityCoins { get; set; }

    public int KeysEarned { get; set; }

    public int PauseCount { get; set; }

    /// <summary>
    /// False for runs the player gave up on. Stored rather than discarded so
    /// abandonment is measurable — it's the behaviour the app exists to reduce.
    /// </summary>
    public bool Completed { get; set; }

    /// <summary>
    /// Client-supplied key that makes cycle submission idempotent, so a retry
    /// after a dropped connection can't pay out twice (backlog card 19).
    /// </summary>
    public string? IdempotencyKey { get; set; }
}
