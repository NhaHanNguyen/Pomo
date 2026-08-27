namespace Pomo.Data.Entities;

/// <summary>
/// One placed building in a player's city. Mirrors <c>PlacedHouse</c> in
/// <c>frontend/src/types.ts</c>.
/// </summary>
public class Building
{
    public Guid Id { get; set; } = Guid.CreateVersion7();

    public Guid UserId { get; set; }
    public User? User { get; set; }

    /// <summary>
    /// Catalogue key, e.g. "small-house". The catalogue itself lives in code
    /// (<c>frontend/src/catalog.ts</c>) rather than the database, so costs and
    /// yields aren't duplicated per row and can be retuned without a migration.
    /// </summary>
    public required string KindId { get; set; }

    /// <summary>Player-renameable; defaults to the catalogue name.</summary>
    public required string Name { get; set; }

    public int GridX { get; set; }
    public int GridY { get; set; }

    public DateTimeOffset BuiltAt { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Minutes of focus the player had banked when this went up — shown in the
    /// House detail panel as a record of what the building cost in real effort.
    /// </summary>
    public int BuiltAfterMinutes { get; set; }
}
