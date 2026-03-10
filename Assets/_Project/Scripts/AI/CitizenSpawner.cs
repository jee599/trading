using UnityEngine;

public class CitizenSpawner : MonoBehaviour
{
    [Header("Spawn Config")]
    public GameObject citizenPrefab;
    public ArchetypeData[] archetypes;
    public bool spawnOnStart = true;

    private void Start()
    {
        if (spawnOnStart)
        {
            SpawnAll();
        }
    }

    public void SpawnAll()
    {
        if (citizenPrefab == null || archetypes == null || archetypes.Length == 0)
        {
            return;
        }

        var zones = FindObjectsByType<SpawnZone>(FindObjectsSortMode.None);

        for (var i = 0; i < archetypes.Length; i++)
        {
            var archetype = archetypes[i];
            if (archetype == null)
            {
                continue;
            }

            for (var count = 0; count < archetype.count; count++)
            {
                var spawnZone = FindZone(archetype.spawnZoneTag, zones);
                var spawnPosition = spawnZone != null ? spawnZone.GetRandomPoint() : transform.position;
                var instance = Instantiate(citizenPrefab, spawnPosition, Quaternion.identity, transform);
                instance.name = archetype.archetypeId + "_" + count.ToString("D2");

                var citizen = instance.GetComponent<CitizenAI>();
                if (citizen == null)
                {
                    citizen = instance.AddComponent<CitizenAI>();
                }

                citizen.Initialize(archetype, PersonalityProfile.GenerateRandom(archetype));
            }
        }

        RelationshipManager.Instance?.GenerateRelationships();
    }

    private static SpawnZone FindZone(string zoneTag, SpawnZone[] zones)
    {
        SpawnZone fallback = null;

        for (var i = 0; i < zones.Length; i++)
        {
            var zone = zones[i];
            if (zone == null)
            {
                continue;
            }

            fallback ??= zone;
            if (string.Equals(zone.zoneTag, zoneTag))
            {
                return zone;
            }
        }

        return fallback;
    }
}
