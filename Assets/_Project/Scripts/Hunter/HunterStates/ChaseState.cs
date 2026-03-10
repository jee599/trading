public class ChaseState : IHunterState
{
    public void Enter(HunterAI hunter)
    {
        hunter.ApplySpeed(hunter.config != null ? hunter.config.chaseSpeed : 4.5f);
    }

    public void Tick(HunterAI hunter)
    {
        var suspicion = hunter.Suspicion != null ? hunter.Suspicion.suspicion : 0f;

        if (suspicion >= 100f)
        {
            hunter.ChangeState(HunterState.Lockdown);
            return;
        }

        if (hunter.SeesPlayer())
        {
            hunter.MoveToPlayer(0.5f);
        }
        else
        {
            hunter.MoveToLastKnownPosition(0.5f);
            if (hunter.IsPlayerHiddenInCrowd() && hunter.StateElapsedTime >= (hunter.config != null ? hunter.config.crowdLoseTime : 3f))
            {
                hunter.ChangeState(HunterState.Investigate);
                return;
            }
        }

        if (suspicion < 70f && hunter.StateElapsedTime >= 2f)
        {
            hunter.ChangeState(HunterState.Investigate);
        }
    }

    public void Exit(HunterAI hunter)
    {
    }
}
