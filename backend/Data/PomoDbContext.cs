using Microsoft.EntityFrameworkCore;
using Pomo.Data.Entities;

namespace Pomo.Data;

public class PomoDbContext(DbContextOptions<PomoDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<PlayerState> PlayerStates => Set<PlayerState>();
    public DbSet<Building> Buildings => Set<Building>();
    public DbSet<FocusCycle> FocusCycles => Set<FocusCycle>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);

            // Emails are normalised to lowercase on write, so a plain unique index
            // is enough to stop Nha@x.com and nha@x.com becoming two accounts.
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Email).HasMaxLength(320).IsRequired();

            e.Property(u => u.PasswordHash).HasMaxLength(256);
            e.Property(u => u.ExternalId).HasMaxLength(256);
            e.HasIndex(u => u.ExternalId);

            e.Property(u => u.MfaSecret).HasMaxLength(128);

            e.HasOne(u => u.State)
                .WithOne(s => s!.User)
                .HasForeignKey<PlayerState>(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<PlayerState>(e =>
        {
            e.HasKey(s => s.UserId);
            e.Property(s => s.Mode).HasMaxLength(16).IsRequired();

            // jsonb rather than text: same storage cost here, but it keeps the door
            // open to querying inside settings later without a migration.
            e.Property(s => s.Settings).HasColumnType("jsonb").IsRequired();

            // Postgres exposes a system column for optimistic concurrency; EF can
            // map it directly instead of us maintaining a version column by hand.
            e.Property(s => s.Version).IsRowVersion();
        });

        b.Entity<Building>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.KindId).HasMaxLength(64).IsRequired();
            e.Property(x => x.Name).HasMaxLength(64).IsRequired();

            // One building per tile, enforced by the database rather than by
            // application logic — two simultaneous purchases can't both win.
            e.HasIndex(x => new { x.UserId, x.GridX, x.GridY }).IsUnique();

            e.HasOne(x => x.User)
                .WithMany(u => u.Buildings)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<FocusCycle>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Mode).HasMaxLength(16).IsRequired();
            e.Property(x => x.IdempotencyKey).HasMaxLength(128);

            // History is always read as "this user's cycles, most recent first".
            e.HasIndex(x => new { x.UserId, x.StartedAt });

            // Partial unique index: idempotency keys must not collide per user, but
            // most rows have none, and NULLs shouldn't compete for uniqueness.
            e.HasIndex(x => new { x.UserId, x.IdempotencyKey })
                .IsUnique()
                .HasFilter("idempotency_key IS NOT NULL");

            e.HasOne(x => x.User)
                .WithMany(u => u.Cycles)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
