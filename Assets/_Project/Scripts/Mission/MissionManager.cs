using System;
using UnityEngine;

public class MissionManager : MonoBehaviour
{
    public static MissionManager Instance { get; private set; }

    public MissionData[] missionPool;
    public float delayBetweenMissions = 20f;
    public bool assignOnStart = true;

    public MissionData ActiveMission { get; private set; }
    public float Progress01 => ActiveMission == null || ActiveMission.requiredWaitSeconds <= 0f
        ? 0f
        : Mathf.Clamp01(_progressSeconds / ActiveMission.requiredWaitSeconds);

    public event Action<MissionData> MissionAssigned;
    public event Action<MissionData> MissionCompleted;
    public event Action<MissionData, float> MissionProgressChanged;

    private PlayerController _player;
    private float _progressSeconds;
    private float _missionDelayTimer;
    private bool _playerInsideTargetZone;

    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }

        Instance = this;
    }

    private void Start()
    {
        _player = FindFirstObjectByType<PlayerController>();
        if (assignOnStart)
        {
            AssignRandomMission();
        }
    }

    private void OnDestroy()
    {
        if (Instance == this)
        {
            Instance = null;
        }
    }

    private void Update()
    {
        if (GameManager.Instance != null && !GameManager.Instance.IsPlaying)
        {
            return;
        }

        if (_player == null)
        {
            _player = FindFirstObjectByType<PlayerController>();
        }

        if (ActiveMission == null)
        {
            if (_missionDelayTimer > 0f)
            {
                _missionDelayTimer = Mathf.Max(0f, _missionDelayTimer - Time.deltaTime);
                if (_missionDelayTimer <= 0f)
                {
                    AssignRandomMission();
                }
            }

            return;
        }

        var countsProgress = _playerInsideTargetZone && ShouldCountProgress();
        if (!countsProgress)
        {
            return;
        }

        _progressSeconds += Time.deltaTime;
        MissionProgressChanged?.Invoke(ActiveMission, Progress01);

        if (_progressSeconds >= ActiveMission.requiredWaitSeconds)
        {
            CompleteMission();
        }
    }

    public bool IsInObjectiveZone(string zoneTag)
    {
        return ActiveMission != null && string.Equals(ActiveMission.targetZoneTag, zoneTag);
    }

    public void NotifyEnteredTrigger(MissionTrigger trigger, PlayerController player)
    {
        if (trigger == null || player == null)
        {
            return;
        }

        _player = player;
        player.ApplyZoneOverride(trigger.zoneTag, trigger.countsAsShelter);
        _playerInsideTargetZone = ActiveMission != null && string.Equals(ActiveMission.targetZoneTag, trigger.zoneTag);
    }

    public void NotifyExitedTrigger(MissionTrigger trigger, PlayerController player)
    {
        if (trigger == null || player == null)
        {
            return;
        }

        player.ClearZoneOverride(trigger.zoneTag);
        if (ActiveMission != null && string.Equals(ActiveMission.targetZoneTag, trigger.zoneTag))
        {
            _playerInsideTargetZone = false;
        }
    }

    public void ResetSession()
    {
        ActiveMission = null;
        _progressSeconds = 0f;
        _playerInsideTargetZone = false;
        _missionDelayTimer = 0f;

        if (assignOnStart)
        {
            AssignRandomMission();
        }
    }

    private void AssignRandomMission()
    {
        if (missionPool == null || missionPool.Length == 0)
        {
            return;
        }

        ActiveMission = missionPool[UnityEngine.Random.Range(0, missionPool.Length)];
        _progressSeconds = 0f;
        _playerInsideTargetZone = false;
        MissionAssigned?.Invoke(ActiveMission);
        MissionProgressChanged?.Invoke(ActiveMission, 0f);
    }

    private bool ShouldCountProgress()
    {
        if (_player == null || ActiveMission == null)
        {
            return false;
        }

        return ActiveMission.missionType switch
        {
            MissionType.BenchSit => !_player.IsMoving,
            _ => true
        };
    }

    private void CompleteMission()
    {
        if (ActiveMission == null)
        {
            return;
        }

        ScoreManager.Instance?.AddScore(ActiveMission.scoreReward);
        var completedMission = ActiveMission;
        MissionCompleted?.Invoke(completedMission);

        ActiveMission = null;
        _progressSeconds = 0f;
        _playerInsideTargetZone = false;
        _missionDelayTimer = delayBetweenMissions;
    }
}
