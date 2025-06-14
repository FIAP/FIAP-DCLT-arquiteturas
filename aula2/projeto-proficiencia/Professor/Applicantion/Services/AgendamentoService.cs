public class AgendamentoService
{
    private readonly IRepository<Agendamento> _agendamentoRepository;

    public AgendamentoService(IRepository<Agendamento> agendamentoRepository)
    {
        _agendamentoRepository = agendamentoRepository;
    }

    public async Task<IEnumerable<Agendamento>> GetAgendamentosAsync()
    {
        return await _agendamentoRepository.GetAllAsync();
    }

    // Outros métodos para adicionar, atualizar, deletar agendamentos
}