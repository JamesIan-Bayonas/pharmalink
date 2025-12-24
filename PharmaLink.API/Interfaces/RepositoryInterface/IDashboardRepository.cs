using PharmaLink.API.DTOs.Dashboard;

namespace PharmaLink.API.Interfaces.RepositoryInterface
{
    public interface IDashboardRepository
    {
        Task<DashboardStatsDto> GetDailyStatsAsync();
    }
}
