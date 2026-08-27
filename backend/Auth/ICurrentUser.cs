namespace Pomo.Auth;

/// <summary>
/// Resolves the user the current request belongs to.
/// </summary>
/// <remarks>
/// This exists so the state endpoints can be written now, before the auth
/// approach is decided (backlog card 2). When real token validation lands
/// (card 7), you implement this against the authenticated principal and every
/// endpoint keeps working unchanged.
/// </remarks>
public interface ICurrentUser
{
    /// <summary>The authenticated user's id, creating the account if it's implied.</summary>
    Task<Guid> GetIdAsync(CancellationToken ct = default);
}
