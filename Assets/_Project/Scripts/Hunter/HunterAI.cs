using System.Collections.Generic;
using UnityEngine;
using UnityEngine.AI;

public enum HunterState
{
    Patrol,
    Investigate,
    Chase,
    Lockdown
}

public interface IHunterState
{
    void Enter(HunterAI hunter);
    void Tick(HunterAI hunter);
    void Exit(HunterAI hunter);
}

[RequireComponent(typeof(NavMeshAgent))]
[RequireComponent(typeof(DetectionSystem))]
public class HunterAI : MonoBehaviour
{
    private static readonly List<HunterAI> ActiveHunters = new List<HunterAI>();

    public HunterState currentState = HunterState.Patrol;
    public HunterConfig config;
    public Transform[] patrolRoute;

    public NavMeshAgent Agent { get; private set; }
    public DetectionSystem Detection { get; private set; }
    public PlayerController Player { get; private set; }
    public SuspicionSystem Suspicion { get; private set; }
    public float StateElapsedTime { get; private set; }
    public float LockdownRemainingTime { get; private set; }
    public Vector3 LastKnownPlayerPosition { get; private set; }

    private readonly PatrolState _patrolState = new PatrolState();
    private readonly InvestigateState _investigateState = new InvestigateState();
    private readonly ChaseState _chaseState = new ChaseState();
    private readonly LockdownState _lockdownState = new LockdownState();

    private IHunterState _stateImpl;
    private int _patrolIndex;

    private void Awake()
    {
        Agent = GetComponent<NavMeshAgent>();
        Detection = GetComponent<DetectionSystem>();
    }

    private void OnEnable()
    {
        if (!ActiveHunters.Contains(this))
        {
            ActiveHunters.Add(this);
        }
    }

    private void OnDisable()
    {
        ActiveHunters.Remove(this);
    }

    private void Start()
    {
        Player = FindFirstObjectByType<PlayerController>();
        Suspicion = FindFirstObjectByType<SuspicionSystem>();
        ChangeState(HunterState.Patrol);
    }

    private void Update()
    {
        if (GameManager.Instance != null && !GameManager.Instance.IsPlaying)
        {
            return;
        }

        if (Player == null)
        {
            Player = FindFirstObjectByType<PlayerController>();
        }

        if (Suspicion == null)
        {
            Suspicion = FindFirstObjectByType<SuspicionSystem>();
        }

        StateElapsedTime += Time.deltaTime;
        if (currentState == HunterState.Lockdown && config != null)
        {
            LockdownRemainingTime = Mathf.Max(0f, config.lockdownDuration - StateElapsedTime);
        }

        if (Player != null && SeesPlayer())
        {
            LastKnownPlayerPosition = Player.transform.position;
        }

        if (IsPrimaryHunter() && Player != null)
        {
            Player.SetHunterEyeContact(AnyHunterSeeingPlayer());
        }

        _stateImpl?.Tick(this);
    }

    public static bool AnyHunterSeeingPlayer()
    {
        for (var i = 0; i < ActiveHunters.Count; i++)
        {
            if (ActiveHunters[i] != null && ActiveHunters[i].SeesPlayer())
            {
                return true;
            }
        }

        return false;
    }

    public static void NotifyPlayerDisguised(bool witnessed, string outfitId)
    {
        for (var i = 0; i < ActiveHunters.Count; i++)
        {
            var hunter = ActiveHunters[i];
            if (hunter != null)
            {
                hunter.HandlePlayerDisguised(witnessed, outfitId);
            }
        }
    }

    public float GetCurrentViewRange()
    {
        if (config == null)
        {
            return 15f;
        }

        return config.type == HunterType.CCTV ? Mathf.Max(config.viewRange, config.cctvRange) : config.viewRange;
    }

    public bool SeesPlayer()
    {
        return Detection != null && Detection.CanSeePlayer(Player);
    }

    public float DistanceToPlayer()
    {
        return Detection != null ? Detection.DistanceToPlayer(Player) : float.MaxValue;
    }

    public void MoveAlongPatrol()
    {
        if (patrolRoute == null || patrolRoute.Length == 0)
        {
            return;
        }

        var target = patrolRoute[_patrolIndex];
        if (target == null)
        {
            return;
        }

        SetDestination(target.position);
        if (!Agent.pathPending && Agent.remainingDistance <= Agent.stoppingDistance + 0.2f)
        {
            _patrolIndex = (_patrolIndex + 1) % patrolRoute.Length;
        }
    }

    public void MoveToPlayer(float stoppingDistance)
    {
        if (Player == null)
        {
            return;
        }

        Agent.stoppingDistance = stoppingDistance;
        SetDestination(Player.transform.position);
    }

    public void MoveToLastKnownPosition(float stoppingDistance)
    {
        Agent.stoppingDistance = stoppingDistance;
        SetDestination(LastKnownPlayerPosition);
    }

    public bool HasReachedDestination()
    {
        return !Agent.pathPending && Agent.remainingDistance <= Agent.stoppingDistance + 0.25f;
    }

    public bool IsPlayerHiddenInCrowd()
    {
        return Player != null && Player.IsInCrowd && !SeesPlayer();
    }

    public void ChangeState(HunterState newState)
    {
        _stateImpl?.Exit(this);
        currentState = newState;
        StateElapsedTime = 0f;
        LockdownRemainingTime = config != null ? config.lockdownDuration : 0f;

        _stateImpl = newState switch
        {
            HunterState.Investigate => _investigateState,
            HunterState.Chase => _chaseState,
            HunterState.Lockdown => _lockdownState,
            _ => _patrolState
        };

        _stateImpl.Enter(this);
    }

    public void ApplySpeed(float speed)
    {
        if (Agent != null)
        {
            Agent.speed = speed;
        }
    }

    public void HandlePlayerDisguised(bool witnessed, string outfitId)
    {
        if (witnessed)
        {
            return;
        }

        if (currentState == HunterState.Chase || currentState == HunterState.Lockdown)
        {
            ChangeState(HunterState.Investigate);
        }
    }

    private void SetDestination(Vector3 destination)
    {
        if (Agent != null && Agent.isOnNavMesh)
        {
            Agent.SetDestination(destination);
        }
    }

    private bool IsPrimaryHunter()
    {
        return ActiveHunters.Count > 0 && ActiveHunters[0] == this;
    }
}
