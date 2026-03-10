using UnityEngine;

public class RelationshipManager : MonoBehaviour
{
    public static RelationshipManager Instance { get; private set; }

    [Header("Relationship Counts")]
    [Range(20, 30)] public int pairCount = 24;
    [Range(0f, 1f)] public float coupleChance = 0.15f;
    [Range(0f, 1f)] public float colleagueChance = 0.35f;
    [Range(0f, 1f)] public float conflictChance = 0.2f;

    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }

        Instance = this;
    }

    private void OnDestroy()
    {
        if (Instance == this)
        {
            Instance = null;
        }
    }

    public void GenerateRelationships()
    {
        var citizens = CitizenAI.GetAllCitizens();
        if (citizens == null || citizens.Count < 2)
        {
            return;
        }

        var pairBudget = Mathf.Min(pairCount, citizens.Count / 2);
        var attempts = 0;
        var created = 0;

        while (created < pairBudget && attempts < pairBudget * 10)
        {
            attempts++;
            var a = citizens[Random.Range(0, citizens.Count)];
            var b = citizens[Random.Range(0, citizens.Count)];
            if (a == null || b == null || a == b)
            {
                continue;
            }

            if (AlreadyLinked(a, b))
            {
                continue;
            }

            var type = RollType();
            a.AddRelationship(b, type);
            b.AddRelationship(a, type);
            created++;
        }
    }

    private static bool AlreadyLinked(CitizenAI a, CitizenAI b)
    {
        var links = a.Relationships;
        for (var i = 0; i < links.Count; i++)
        {
            if (links[i].Other == b)
            {
                return true;
            }
        }

        return false;
    }

    private RelationshipType RollType()
    {
        var roll = Random.value;
        if (roll <= coupleChance)
        {
            return RelationshipType.Couple;
        }

        if (roll <= coupleChance + colleagueChance)
        {
            return RelationshipType.Colleague;
        }

        if (roll <= coupleChance + colleagueChance + conflictChance)
        {
            return RelationshipType.Conflict;
        }

        return RelationshipType.Acquaintance;
    }
}
