using UnityEngine;

[RequireComponent(typeof(CharacterController))]
public class PlayerController : MonoBehaviour
{
    [Header("Movement")]
    public float walkSpeed = 3.5f;
    public float runSpeed = 5.5f;
    public float rotationLerp = 14f;
    public float gravity = -18f;
    public bool allowKeyboardFallback = true;
    public Transform cameraPivot;

    [Header("Readability")]
    public float zoneDetectRadius = 4f;
    public float crowdDetectRadius = 6f;
    public int crowdThreshold = 4;
    public float loiterThresholdSeconds = 8f;
    public float directionChangeAngle = 55f;

    public Vector2 MoveInput { get; private set; }
    public Vector3 WorldMoveDirection { get; private set; }
    public bool IsMoving => MoveInput.sqrMagnitude > 0.01f;
    public bool IsRunning => _runInput && IsMoving;
    public bool IsInCrowd { get; private set; }
    public bool IsMovingAgainstCrowd { get; private set; }
    public bool IsLoitering { get; private set; }
    public bool IsDirectionless => _erraticTimer > 1f;
    public bool IsHunterEyeContact => _hunterEyeContact;
    public bool IsActingNatural => !IsRunning && !IsDirectionless && !IsMovingAgainstCrowd && !IsHunterEyeContact;
    public bool IsSheltered => _zoneOverrideSheltered || (_nearestDestination != null && _nearestDestination.countsAsShelter);
    public string CurrentZoneTag { get; private set; }

    private CharacterController _characterController;
    private SuspicionSystem _suspicion;
    private Vector2 _virtualInput;
    private Vector3 _lastMoveDirection;
    private float _verticalVelocity;
    private float _erraticTimer;
    private float _sameZoneTimer;
    private float _lastCollisionPenaltyAt = -999f;
    private bool _movementLocked;
    private bool _runInput;
    private bool _hunterEyeContact;
    private string _zoneOverrideTag = string.Empty;
    private bool _zoneOverrideSheltered;
    private string _lastZoneTag = string.Empty;
    private DestinationPoint _nearestDestination;

    private void Awake()
    {
        _characterController = GetComponent<CharacterController>();
        _suspicion = GetComponent<SuspicionSystem>();
    }

    private void Update()
    {
        if (GameManager.Instance != null && !GameManager.Instance.IsPlaying)
        {
            return;
        }

        UpdateInput();
        UpdateMovement();
        UpdateZoneContext();
        UpdateCrowdContext();
        UpdateBehaviourContext();
    }

    public void SetMoveInput(Vector2 input)
    {
        _virtualInput = Vector2.ClampMagnitude(input, 1f);
    }

    public void LockMovement(bool locked)
    {
        _movementLocked = locked;
        if (locked)
        {
            MoveInput = Vector2.zero;
            WorldMoveDirection = Vector3.zero;
        }
    }

    public void SetHunterEyeContact(bool value)
    {
        _hunterEyeContact = value;
    }

    public void ApplyZoneOverride(string zoneTag, bool sheltered)
    {
        _zoneOverrideTag = zoneTag;
        _zoneOverrideSheltered = sheltered;
    }

    public void ClearZoneOverride(string zoneTag)
    {
        if (string.Equals(_zoneOverrideTag, zoneTag))
        {
            _zoneOverrideTag = string.Empty;
            _zoneOverrideSheltered = false;
        }
    }

    private void UpdateInput()
    {
        if (_movementLocked)
        {
            MoveInput = Vector2.zero;
            _runInput = false;
            return;
        }

        if (JoystickUI.ActiveJoystick != null)
        {
            _virtualInput = JoystickUI.ActiveJoystick.Output;
        }

        var keyboardInput = allowKeyboardFallback
            ? new Vector2(Input.GetAxisRaw("Horizontal"), Input.GetAxisRaw("Vertical"))
            : Vector2.zero;

        MoveInput = _virtualInput.sqrMagnitude >= keyboardInput.sqrMagnitude ? _virtualInput : keyboardInput;
        MoveInput = Vector2.ClampMagnitude(MoveInput, 1f);
        _runInput = Input.GetKey(KeyCode.LeftShift);
    }

    private void UpdateMovement()
    {
        var referenceForward = cameraPivot != null ? cameraPivot.forward : Camera.main != null ? Camera.main.transform.forward : Vector3.forward;
        var referenceRight = cameraPivot != null ? cameraPivot.right : Camera.main != null ? Camera.main.transform.right : Vector3.right;

        referenceForward.y = 0f;
        referenceRight.y = 0f;
        referenceForward.Normalize();
        referenceRight.Normalize();

        WorldMoveDirection = referenceForward * MoveInput.y + referenceRight * MoveInput.x;
        if (WorldMoveDirection.sqrMagnitude > 1f)
        {
            WorldMoveDirection.Normalize();
        }

        var currentSpeed = IsRunning ? runSpeed : walkSpeed;
        var move = WorldMoveDirection * currentSpeed;
        if (_characterController.isGrounded && _verticalVelocity < 0f)
        {
            _verticalVelocity = -2f;
        }
        else
        {
            _verticalVelocity += gravity * Time.deltaTime;
        }

        move.y = _verticalVelocity;

        _characterController.Move(move * Time.deltaTime);

        if (WorldMoveDirection.sqrMagnitude > 0.001f)
        {
            var targetRotation = Quaternion.LookRotation(WorldMoveDirection);
            transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, rotationLerp * Time.deltaTime);
        }
    }

    private void UpdateZoneContext()
    {
        _nearestDestination = DestinationPoint.GetNearest(transform.position, zoneDetectRadius);
        CurrentZoneTag = !string.IsNullOrEmpty(_zoneOverrideTag)
            ? _zoneOverrideTag
            : _nearestDestination != null ? _nearestDestination.zoneTag : string.Empty;

        if (!string.Equals(CurrentZoneTag, _lastZoneTag))
        {
            _sameZoneTimer = 0f;
            _lastZoneTag = CurrentZoneTag;
        }
    }

    private void UpdateCrowdContext()
    {
        var citizens = CitizenAI.GetAllCitizens();
        var nearbyCount = 0;
        var averageVelocity = Vector3.zero;

        for (var i = 0; i < citizens.Count; i++)
        {
            var citizen = citizens[i];
            if (citizen == null)
            {
                continue;
            }

            var offset = citizen.transform.position - transform.position;
            if (offset.sqrMagnitude > crowdDetectRadius * crowdDetectRadius)
            {
                continue;
            }

            nearbyCount++;
            averageVelocity += citizen.Agent != null ? citizen.Agent.velocity : Vector3.zero;
        }

        IsInCrowd = nearbyCount >= crowdThreshold || (_nearestDestination != null && _nearestDestination.countsAsCrowdZone);

        if (nearbyCount > 0)
        {
            averageVelocity /= nearbyCount;
        }

        var flowDirection = averageVelocity.normalized;
        IsMovingAgainstCrowd = WorldMoveDirection.sqrMagnitude > 0.1f
            && flowDirection.sqrMagnitude > 0.01f
            && Vector3.Dot(WorldMoveDirection.normalized, flowDirection) < -0.25f;
    }

    private void UpdateBehaviourContext()
    {
        if (WorldMoveDirection.sqrMagnitude > 0.1f && _lastMoveDirection.sqrMagnitude > 0.1f)
        {
            var angle = Vector3.Angle(_lastMoveDirection, WorldMoveDirection);
            if (angle >= directionChangeAngle)
            {
                _erraticTimer += Time.deltaTime;
            }
            else
            {
                _erraticTimer = Mathf.Max(0f, _erraticTimer - Time.deltaTime * 0.5f);
            }
        }
        else
        {
            _erraticTimer = Mathf.Max(0f, _erraticTimer - Time.deltaTime);
        }

        _lastMoveDirection = WorldMoveDirection.sqrMagnitude > 0.1f ? WorldMoveDirection.normalized : _lastMoveDirection;

        if (string.IsNullOrEmpty(CurrentZoneTag))
        {
            _sameZoneTimer = 0f;
            IsLoitering = false;
            return;
        }

        if (!IsMoving)
        {
            _sameZoneTimer += Time.deltaTime;
        }
        else
        {
            _sameZoneTimer = Mathf.Max(0f, _sameZoneTimer - Time.deltaTime);
        }

        IsLoitering = _sameZoneTimer >= loiterThresholdSeconds;
    }

    private void OnControllerColliderHit(ControllerColliderHit hit)
    {
        if (hit.collider == null || _suspicion == null)
        {
            return;
        }

        if (hit.moveDirection.sqrMagnitude > 0.1f && Time.time >= _lastCollisionPenaltyAt + 0.5f)
        {
            _lastCollisionPenaltyAt = Time.time;
            _suspicion.AddCollisionPenalty();
        }
    }
}
