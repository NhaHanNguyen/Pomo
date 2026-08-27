namespace Pomo.Data.Entities;

/// <summary>
/// A Pomo account.
/// </summary>
/// <remarks>
/// Deliberately provider-agnostic, because the auth approach isn't decided yet
/// (backlog card 2). Both shapes fit:
///
/// - Self-hosted credentials: <see cref="PasswordHash"/> is set, <see cref="ExternalId"/> is null.
/// - Hosted provider (Auth0, Clerk, Supabase): the reverse.
///
/// If you later adopt ASP.NET Core Identity, Identity brings its own user schema
/// and this entity becomes a profile table keyed to it rather than the source of
/// truth for credentials.
/// </remarks>
public class User
{
    public Guid Id { get; set; } = Guid.CreateVersion7();

    /// <summary>Stored lowercased and trimmed so casing can't create duplicate accounts.</summary>
    public required string Email { get; set; }

    /// <summary>Null when an external identity provider owns the credentials.</summary>
    public string? PasswordHash { get; set; }

    /// <summary>Subject claim from an external identity provider, when one is used.</summary>
    public string? ExternalId { get; set; }

    public bool EmailVerified { get; set; }

    /// <summary>TOTP shared secret. The wiki asks for MFA; this is where it lands.</summary>
    public string? MfaSecret { get; set; }

    public bool MfaEnabled { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public DateTimeOffset? LastLoginAt { get; set; }

    public PlayerState? State { get; set; }
    public List<Building> Buildings { get; set; } = [];
    public List<FocusCycle> Cycles { get; set; } = [];
}
