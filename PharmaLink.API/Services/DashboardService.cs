using PharmaLink.API.DTOs.Dashboard;
using PharmaLink.API.Interfaces.RepositoryInterface;
using PharmaLink.API.Interfaces.ServiceInterface;

namespace PharmaLink.API.Services
{
    public class DashboardService(IDashboardRepository dashboardRepository) : IDashboardService
    {
        public async Task<DashboardStatsDto> GetStatsAsync()
        {
            return await dashboardRepository.GetDailyStatsAsync();
        }
    }
}