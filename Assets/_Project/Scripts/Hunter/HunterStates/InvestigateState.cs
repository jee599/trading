public class InvestigateState : IHunterState
{
    public void Enter(HunterAI hunter)
    {
        hunter.ApplySpeed(hunter.config != null ? hunter.config.investigateSpeed : 2.5f);
    }

    public void Tick(HunterAI hunter)
    {
        var suspicion = hunter.Suspicion != null ? hunter.Suspicion.suspicion : 0f;

        if (suspicion >= 100f)
        {
            hunter.ChangeState(HunterState.Lockdown);
            return;
        }

        if (suspicion >= 70f)
        {
            hunter.ChangeState(HunterState.Chase);
            return;
        }

        if (hunter.Player != null)
        {
            hunter.MoveToPlayer(1.5f);
        }

        if (suspicion < 40f && hunter.StateElapsedTime >= (hunter.config != null ? hunter.config.investigateDuration : 5f))
        {
            hunter.ChangeState(HunterState.Patrol);
        }
    }

    public void Exit(HunterAI hunter)
    {
    }
}
