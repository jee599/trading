using UnityEngine;

[CreateAssetMenu(menuName = "BlendIn/Events/DeliveryRushEvent")]
public class DeliveryRushEvent : GameEvent
{
    public override bool TryGetCitizenReaction(CitizenAI citizen, out EventReaction reaction)
    {
        reaction = new EventReaction
        {
            eventId = eventId,
            destinationTag = citizen != null ? citizen.CurrentScheduleOption.destinationTag : string.Empty,
            hurry = true,
            waitSeconds = Mathf.Max(0.5f, citizenWaitSeconds),
            animationState = CitizenAnimationState.Walk
        };

        return citizen != null;
    }
}
