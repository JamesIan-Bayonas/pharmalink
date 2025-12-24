using PharmaLink.API.DTOs.Dashboard;

namespace PharmaLink.API.Interfaces.ServiceInterface
{
    public interface IDashboardService
    {
        Task<DashboardStatsDto> GetStatsAsync();
    }
}