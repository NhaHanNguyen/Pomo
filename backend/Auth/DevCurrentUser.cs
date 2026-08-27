using Microsoft.EntityFrameworkCore;
using Pomo.Data;
using Pomo.Data.Entities;

namespace Pomo.Auth;

/// <summary>
/// Development stand-in that resolves every request to one fixed local account.
/// </summary>
/// <remarks>
/// THIS IS NOT AUTHENTICATION. It performs no checks whatsoever — every caller
/// is the same user. It exists purely so the state endpoints can be built and
/// tested before auth exists, and it is registered only in the Development
/// environment. <c>Program.cs</c> refuses to start in Production unless a real
/// implementation has replaced it, so this cannot reach a deployed environment
/// by being forgotten.
/// </remarks>
public class DevCurrentUser(PomoDbContext db) : ICurrentUser
{
    /// <summary>Stable id so the local database survives restarts with the same account.</summary>
    private static readonly Guid DevUserId =
        new("11111111-1111-1111-1111-111111111111");

    private const string DevEmail = "dev@pomo.local";

    public async Task<Guid> GetIdAsync(CancellationToken ct = default)
    {
        var exists = await db.Users.AnyAsync(u => u.Id == DevUserId, ct);
        if (exists) return DevUserId;

        db.Users.Add(new User
        {
            Id = DevUserId,
            Email = DevEmail,
            EmailVerified = true,
        });
        await db.SaveChangesAsync(ct);

        return DevUserId;
    }
}
