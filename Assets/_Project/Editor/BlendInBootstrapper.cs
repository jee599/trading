#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;
using UnityEngine.AI;
using UnityEngine.EventSystems;
using UnityEngine.Rendering;
using UnityEngine.UI;

public static partial class BlendInBootstrapper
{
    private const string ProjectRoot = "Assets/_Project";
    private const string SceneRoot = ProjectRoot + "/Scenes";
    private const string PrefabRoot = ProjectRoot + "/Prefabs";
    private const string MaterialRoot = ProjectRoot + "/Art/Materials";
    private const string DataRoot = ProjectRoot + "/Data";

    private sealed class BlendInBootstrapAssets
    {
        public ArchetypeData[] Archetypes;
        public ScheduleTable[] Schedules;
        public MissionData[] Missions;
        public GameEvent[] Events;
        public HunterConfig HunterConfig;
        public OutfitData[] Outfits;
        public Material CitizenMaterial;
        public Material PlayerMaterial;
        public Material HunterMaterial;
        public Material GroundMaterial;
        public Material BuildingMaterial;
        public GameObject PlayerPrefab;
        public GameObject CitizenPrefab;
        public GameObject HunterPrefab;
    }

    [MenuItem("Blend In/Bootstrap Prototype")]
    public static void BootstrapPrototype()
    {
        EnsureFolders();

        var assets = CreateDataAssets();
        CreatePrefabs(assets);
        CreateScenes(assets);

        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();

        EditorUtility.DisplayDialog(
            "Blend In",
            "Prototype bootstrap complete. Open Assets/_Project/Scenes/GameScene.unity and bake the NavMesh before playtesting.",
            "OK");
    }

    private static void EnsureFolders()
    {
        EnsureFolder("Assets", "_Project");
        EnsureFolder(ProjectRoot, "Editor");
        EnsureFolder(ProjectRoot, "Scenes");
        EnsureFolder(ProjectRoot, "Prefabs");
        EnsureFolder(ProjectRoot, "Art");
        EnsureFolder(ProjectRoot + "/Art", "Materials");
        EnsureFolder(ProjectRoot, "Data");
        EnsureFolder(DataRoot, "Archetypes");
        EnsureFolder(DataRoot, "Schedules");
        EnsureFolder(DataRoot, "HunterConfigs");
        EnsureFolder(DataRoot, "Missions");
        EnsureFolder(DataRoot, "Events");
        EnsureFolder(DataRoot, "Outfits");
    }

    private static void EnsureFolder(string parent, string child)
    {
        var fullPath = parent + "/" + child;
        if (!AssetDatabase.IsValidFolder(fullPath))
        {
            AssetDatabase.CreateFolder(parent, child);
        }
    }

    private static BlendInBootstrapAssets CreateDataAssets()
    {
        var assets = new BlendInBootstrapAssets
        {
            CitizenMaterial = CreateOrUpdateMaterial(MaterialRoot + "/CitizenShared.mat", new Color(0.56f, 0.67f, 0.82f)),
            PlayerMaterial = CreateOrUpdateMaterial(MaterialRoot + "/PlayerShared.mat", new Color(0.20f, 0.85f, 0.50f)),
            HunterMaterial = CreateOrUpdateMaterial(MaterialRoot + "/HunterShared.mat", new Color(0.90f, 0.25f, 0.25f)),
            GroundMaterial = CreateOrUpdateMaterial(MaterialRoot + "/Ground.mat", new Color(0.48f, 0.72f, 0.47f)),
            BuildingMaterial = CreateOrUpdateMaterial(MaterialRoot + "/Building.mat", new Color(0.80f, 0.80f, 0.84f))
        };

        assets.Outfits = CreateOutfits();
        assets.Schedules = CreateSchedules();
        assets.Archetypes = CreateArchetypes(assets.Schedules);
        assets.Missions = CreateMissions();
        assets.Events = CreateEvents();
        assets.HunterConfig = CreateHunterConfig();
        return assets;
    }

    private static OutfitData[] CreateOutfits()
    {
        return new[]
        {
            CreateOrUpdateAsset<OutfitData>(DataRoot + "/Outfits/Outfit_Blue.asset", asset =>
            {
                asset.outfitId = "Blue";
                asset.useExplicitColor = true;
                asset.tintColor = new Color(0.25f, 0.55f, 0.90f);
            }),
            CreateOrUpdateAsset<OutfitData>(DataRoot + "/Outfits/Outfit_Orange.asset", asset =>
            {
                asset.outfitId = "Orange";
                asset.useExplicitColor = true;
                asset.tintColor = new Color(0.95f, 0.55f, 0.18f);
            }),
            CreateOrUpdateAsset<OutfitData>(DataRoot + "/Outfits/Outfit_Green.asset", asset =>
            {
                asset.outfitId = "Green";
                asset.useExplicitColor = true;
                asset.tintColor = new Color(0.20f, 0.72f, 0.42f);
            })
        };
    }

    private static ScheduleTable[] CreateSchedules()
    {
        return new[]
        {
            CreateOrUpdateAsset<ScheduleTable>(DataRoot + "/Schedules/OfficeWorkerSchedule.asset", asset =>
            {
                asset.slots = new[]
                {
                    Slot(8f, Option("Office", 0.6f, TransportMode.Bus), Option("Office", 0.3f, TransportMode.Walk), Option("Office", 0.1f, TransportMode.Fast)),
                    Slot(10f, Option("Office", 1f, TransportMode.Walk, 8f)),
                    Slot(12f, Option("Cafe", 0.4f, TransportMode.Walk, 4f), Option("Convenience", 0.3f, TransportMode.Walk, 3f), Option("Restaurant", 0.2f, TransportMode.Walk, 5f), Option("Office", 0.1f, TransportMode.Walk, 4f)),
                    Slot(14f, Option("Office", 1f, TransportMode.Walk, 8f)),
                    Slot(17f, Option("Home", 0.5f, TransportMode.Bus), Option("Park", 0.25f, TransportMode.Walk, 4f), Option("Shop", 0.15f, TransportMode.Walk, 4f), Option("Office", 0.1f, TransportMode.Walk, 6f)),
                    Slot(19f, Option("Home", 1f, TransportMode.Walk, 6f))
                };
            }),
            CreateOrUpdateAsset<ScheduleTable>(DataRoot + "/Schedules/StudentSchedule.asset", asset =>
            {
                asset.slots = new[]
                {
                    Slot(8f, Option("School", 1f, TransportMode.Walk, 5f)),
                    Slot(10f, Option("School", 1f, TransportMode.Walk, 6f)),
                    Slot(12f, Option("Convenience", 0.5f, TransportMode.Walk, 3f), Option("Cafe", 0.3f, TransportMode.Walk, 4f), Option("School", 0.2f, TransportMode.Walk, 3f)),
                    Slot(14f, Option("Park", 0.4f, TransportMode.Walk, 4f), Option("Convenience", 0.3f, TransportMode.Walk, 3f), Option("School", 0.3f, TransportMode.Walk, 5f)),
                    Slot(17f, Option("Home", 0.6f, TransportMode.Walk, 5f), Option("Park", 0.4f, TransportMode.Walk, 4f)),
                    Slot(19f, Option("Home", 1f, TransportMode.Walk, 6f))
                };
            }),
            CreateOrUpdateAsset<ScheduleTable>(DataRoot + "/Schedules/ElderSchedule.asset", asset =>
            {
                asset.slots = new[]
                {
                    Slot(8f, Option("Park", 0.7f, TransportMode.Walk, 6f), Option("Home", 0.3f, TransportMode.Walk, 5f)),
                    Slot(10f, Option("Park", 1f, TransportMode.Walk, 8f)),
                    Slot(12f, Option("Home", 0.5f, TransportMode.Walk, 5f), Option("Restaurant", 0.5f, TransportMode.Walk, 4f)),
                    Slot(14f, Option("Park", 1f, TransportMode.Walk, 6f)),
                    Slot(17f, Option("Home", 1f, TransportMode.Walk, 6f)),
                    Slot(19f, Option("Home", 1f, TransportMode.Walk, 6f))
                };
            }),
            CreateOrUpdateAsset<ScheduleTable>(DataRoot + "/Schedules/DeliverySchedule.asset", asset =>
            {
                asset.slots = new[]
                {
                    Slot(8f, Option("Restaurant", 0.5f, TransportMode.Fast, 1f), Option("BusStop", 0.5f, TransportMode.Fast, 1f)),
                    Slot(10f, Option("Restaurant", 0.5f, TransportMode.Fast, 1f), Option("Home", 0.5f, TransportMode.Fast, 1f)),
                    Slot(12f, Option("Restaurant", 0.5f, TransportMode.Fast, 1f), Option("Office", 0.5f, TransportMode.Fast, 1f)),
                    Slot(14f, Option("Cafe", 0.5f, TransportMode.Fast, 1f), Option("Home", 0.5f, TransportMode.Fast, 1f)),
                    Slot(17f, Option("Restaurant", 0.5f, TransportMode.Walk, 2f), Option("Home", 0.5f, TransportMode.Walk, 2f)),
                    Slot(19f, Option("Home", 1f, TransportMode.Walk, 4f))
                };
            }),
            CreateOrUpdateAsset<ScheduleTable>(DataRoot + "/Schedules/ShopkeeperSchedule.asset", asset =>
            {
                asset.slots = new[]
                {
                    Slot(8f, Option("Shop", 1f, TransportMode.Walk, 6f)),
                    Slot(10f, Option("Shop", 1f, TransportMode.Walk, 6f)),
                    Slot(12f, Option("Shop", 0.7f, TransportMode.Walk, 6f), Option("Restaurant", 0.3f, TransportMode.Walk, 3f)),
                    Slot(14f, Option("Shop", 1f, TransportMode.Walk, 6f)),
                    Slot(17f, Option("Shop", 1f, TransportMode.Walk, 6f)),
                    Slot(19f, Option("Home", 1f, TransportMode.Walk, 5f))
                };
            }),
            CreateOrUpdateAsset<ScheduleTable>(DataRoot + "/Schedules/WalkerSchedule.asset", asset =>
            {
                asset.slots = new[]
                {
                    Slot(8f, Option("Park", 0.5f, TransportMode.Walk, 3f), Option("Plaza", 0.5f, TransportMode.Walk, 3f)),
                    Slot(10f, Option("Plaza", 0.5f, TransportMode.Walk, 3f), Option("Park", 0.5f, TransportMode.Walk, 3f)),
                    Slot(12f, Option("Bench", 0.4f, TransportMode.Walk, 5f), Option("Park", 0.6f, TransportMode.Walk, 3f)),
                    Slot(14f, Option("Plaza", 0.5f, TransportMode.Walk, 3f), Option("Park", 0.5f, TransportMode.Walk, 3f)),
                    Slot(17f, Option("Park", 0.5f, TransportMode.Walk, 4f), Option("Home", 0.5f, TransportMode.Walk, 4f)),
                    Slot(19f, Option("Home", 1f, TransportMode.Walk, 5f))
                };
            }),
            CreateOrUpdateAsset<ScheduleTable>(DataRoot + "/Schedules/CoupleSchedule.asset", asset =>
            {
                asset.slots = new[]
                {
                    Slot(8f, Option("Plaza", 1f, TransportMode.Walk, 3f)),
                    Slot(10f, Option("Cafe", 0.5f, TransportMode.Walk, 4f), Option("Park", 0.5f, TransportMode.Walk, 4f)),
                    Slot(12f, Option("Restaurant", 1f, TransportMode.Walk, 5f)),
                    Slot(14f, Option("Park", 1f, TransportMode.Walk, 5f)),
                    Slot(17f, Option("Home", 1f, TransportMode.Walk, 5f)),
                    Slot(19f, Option("Home", 1f, TransportMode.Walk, 6f))
                };
            }),
            CreateOrUpdateAsset<ScheduleTable>(DataRoot + "/Schedules/GuardSchedule.asset", asset =>
            {
                asset.slots = new[]
                {
                    Slot(8f, Option("Patrol", 1f, TransportMode.Walk, 3f)),
                    Slot(10f, Option("Patrol", 1f, TransportMode.Walk, 3f)),
                    Slot(12f, Option("Patrol", 0.5f, TransportMode.Walk, 3f), Option("BusStop", 0.5f, TransportMode.Walk, 2f)),
                    Slot(14f, Option("Patrol", 1f, TransportMode.Walk, 3f)),
                    Slot(17f, Option("Patrol", 1f, TransportMode.Walk, 3f)),
                    Slot(19f, Option("Home", 1f, TransportMode.Walk, 5f))
                };
            }),
            CreateOrUpdateAsset<ScheduleTable>(DataRoot + "/Schedules/VendorSchedule.asset", asset =>
            {
                asset.slots = new[]
                {
                    Slot(8f, Option("Vendor", 1f, TransportMode.Walk, 6f)),
                    Slot(10f, Option("Vendor", 1f, TransportMode.Walk, 6f)),
                    Slot(12f, Option("Vendor", 1f, TransportMode.Walk, 6f)),
                    Slot(14f, Option("Vendor", 1f, TransportMode.Walk, 6f)),
                    Slot(17f, Option("Vendor", 1f, TransportMode.Walk, 5f)),
                    Slot(19f, Option("Home", 1f, TransportMode.Walk, 5f))
                };
            })
        };
    }

    private static ArchetypeData[] CreateArchetypes(ScheduleTable[] schedules)
    {
        return new[]
        {
            CreateArchetype("OfficeWorker", 30, CitizenBehaviorPreset.OfficeWorker, "Home", schedules[0], 1.0f, 0.35f, 0.15f),
            CreateArchetype("Student", 20, CitizenBehaviorPreset.Student, "Home", schedules[1], 1.05f, 0.45f, 0.20f),
            CreateArchetype("Elder", 10, CitizenBehaviorPreset.Elder, "Home", schedules[2], 0.85f, 0.25f, 0.05f),
            CreateArchetype("DeliveryDriver", 10, CitizenBehaviorPreset.DeliveryDriver, "Restaurant", schedules[3], 1.20f, 0.20f, 0.10f),
            CreateArchetype("Shopkeeper", 10, CitizenBehaviorPreset.Shopkeeper, "Shop", schedules[4], 0.95f, 0.25f, 0.08f),
            CreateArchetype("Walker", 8, CitizenBehaviorPreset.Walker, "Park", schedules[5], 1.0f, 0.20f, 0.12f),
            CreateArchetype("Couple", 6, CitizenBehaviorPreset.Couple, "Home", schedules[6], 1.0f, 0.55f, 0.05f),
            CreateArchetype("Guard", 4, CitizenBehaviorPreset.Guard, "Patrol", schedules[7], 1.0f, 0.15f, 0.05f),
            CreateArchetype("StreetVendor", 2, CitizenBehaviorPreset.StreetVendor, "Vendor", schedules[8], 0.9f, 0.30f, 0.05f)
        };
    }

    private static ArchetypeData CreateArchetype(string id, int count, CitizenBehaviorPreset behaviorPreset, string spawnZoneTag, ScheduleTable schedule, float walkSpeedBase, float sociabilityBase, float phoneBase)
    {
        return CreateOrUpdateAsset<ArchetypeData>(DataRoot + "/Archetypes/" + id + ".asset", asset =>
        {
            asset.archetypeId = id;
            asset.count = count;
            asset.spawnZoneTag = spawnZoneTag;
            asset.behaviorPreset = behaviorPreset;
            asset.scheduleTable = schedule;
            asset.personalityRanges.walkSpeed = new FloatRange { min = walkSpeedBase - 0.1f, max = walkSpeedBase + 0.1f };
            asset.personalityRanges.patience = new FloatRange { min = 4f, max = 10f };
            asset.personalityRanges.sociability = new FloatRange { min = Mathf.Max(0f, sociabilityBase - 0.15f), max = Mathf.Min(1f, sociabilityBase + 0.15f) };
            asset.personalityRanges.curiosity = new FloatRange { min = 0.05f, max = 0.35f };
            asset.personalityRanges.routineBreak = new FloatRange { min = 0f, max = 0.15f };
            asset.personalityRanges.phoneAddiction = new FloatRange { min = Mathf.Max(0f, phoneBase - 0.08f), max = Mathf.Min(0.5f, phoneBase + 0.08f) };
            asset.personalityRanges.awareness = new FloatRange { min = 0.15f, max = 0.6f };
        });
    }

    private static MissionData[] CreateMissions()
    {
        return new[]
        {
            CreateOrUpdateAsset<MissionData>(DataRoot + "/Missions/CoffeeOrder.asset", asset =>
            {
                asset.missionId = "CoffeeOrder";
                asset.description = "Order coffee at the cafe";
                asset.missionType = MissionType.CoffeeOrder;
                asset.targetZoneTag = "Cafe";
                asset.requiredWaitSeconds = 3f;
                asset.scoreReward = 100;
            }),
            CreateOrUpdateAsset<MissionData>(DataRoot + "/Missions/BusWait.asset", asset =>
            {
                asset.missionId = "BusWait";
                asset.description = "Wait naturally at the bus stop";
                asset.missionType = MissionType.BusWait;
                asset.targetZoneTag = "BusStop";
                asset.requiredWaitSeconds = 5f;
                asset.scoreReward = 150;
            }),
            CreateOrUpdateAsset<MissionData>(DataRoot + "/Missions/BenchSit.asset", asset =>
            {
                asset.missionId = "BenchSit";
                asset.description = "Sit or stay still by the park bench";
                asset.missionType = MissionType.BenchSit;
                asset.targetZoneTag = "Bench";
                asset.requiredWaitSeconds = 10f;
                asset.scoreReward = 80;
            })
        };
    }

    private static GameEvent[] CreateEvents()
    {
        return new GameEvent[]
        {
            CreateOrUpdateAsset<RainEvent>(DataRoot + "/Events/RainEvent.asset", asset =>
            {
                asset.eventId = "Rain";
                asset.displayName = "Rain";
                asset.duration = 30f;
                asset.reactionDestinationTag = "Shelter";
            }),
            CreateOrUpdateAsset<AccidentEvent>(DataRoot + "/Events/AccidentEvent.asset", asset =>
            {
                asset.eventId = "Accident";
                asset.displayName = "Accident";
                asset.duration = 20f;
                asset.reactionDestinationTag = "Accident";
            }),
            CreateOrUpdateAsset<PerformanceEvent>(DataRoot + "/Events/PerformanceEvent.asset", asset =>
            {
                asset.eventId = "Performance";
                asset.displayName = "Performance";
                asset.duration = 40f;
                asset.reactionDestinationTag = "Performance";
            }),
            CreateOrUpdateAsset<PoliceCheckEvent>(DataRoot + "/Events/PoliceCheckEvent.asset", asset =>
            {
                asset.eventId = "PoliceCheck";
                asset.displayName = "Police Check";
                asset.duration = 25f;
                asset.reactionDestinationTag = "SideStreet";
                asset.affectedZoneTags = new[] { "Plaza", "BusStop" };
            }),
            CreateOrUpdateAsset<DeliveryRushEvent>(DataRoot + "/Events/DeliveryRushEvent.asset", asset =>
            {
                asset.eventId = "DeliveryRush";
                asset.displayName = "Delivery Rush";
                asset.duration = 30f;
            }),
            CreateOrUpdateAsset<LunchSaleEvent>(DataRoot + "/Events/LunchSaleEvent.asset", asset =>
            {
                asset.eventId = "LunchSale";
                asset.displayName = "Lunch Sale";
                asset.duration = 35f;
                asset.reactionDestinationTag = "Restaurant";
            }),
            CreateOrUpdateAsset<BlackoutEvent>(DataRoot + "/Events/BlackoutEvent.asset", asset =>
            {
                asset.eventId = "Blackout";
                asset.displayName = "Blackout";
                asset.duration = 20f;
                asset.reactionDestinationTag = "Exit";
            })
        };
    }

    private static HunterConfig CreateHunterConfig()
    {
        return CreateOrUpdateAsset<HunterConfig>(DataRoot + "/HunterConfigs/PrototypeHunter.asset", asset =>
        {
            asset.type = HunterType.Patrol;
            asset.patrolStyle = HunterPatrolStyle.FixedRoute;
            asset.patrolSpeed = 3.2f;
            asset.investigateSpeed = 3.0f;
            asset.chaseSpeed = 5.2f;
            asset.viewAngle = 100f;
            asset.viewRange = 16f;
            asset.cctvRange = 24f;
            asset.investigateDuration = 5f;
            asset.lockdownDuration = 10f;
            asset.crowdLoseTime = 3f;
            asset.captureDistance = 1.6f;
        });
    }

    private static void CreatePrefabs(BlendInBootstrapAssets assets)
    {
        assets.CitizenPrefab = CreateCitizenPrefab(assets);
        assets.PlayerPrefab = CreatePlayerPrefab(assets);
        assets.HunterPrefab = CreateHunterPrefab(assets);
    }

    private static GameObject CreateCitizenPrefab(BlendInBootstrapAssets assets)
    {
        var root = new GameObject("Citizen");
        var agent = root.AddComponent<NavMeshAgent>();
        agent.radius = 0.3f;
        agent.height = 1.8f;
        agent.speed = 2.5f;
        agent.angularSpeed = 720f;
        agent.acceleration = 12f;
        var citizen = root.AddComponent<CitizenAI>();
        var variation = root.AddComponent<CharacterVariation>();

        var visual = CreatePrimitiveVisual("Body", PrimitiveType.Capsule, root.transform, assets.CitizenMaterial, new Vector3(0f, 1f, 0f), new Vector3(0.8f, 1f, 0.8f));
        variation.bodyVariants = new[] { visual };
        variation.tintRenderers = new[] { visual.GetComponent<Renderer>() };

        var prefab = SaveAsPrefab(root, PrefabRoot + "/Citizen.prefab");
        Object.DestroyImmediate(root);
        return prefab;
    }

    private static GameObject CreatePlayerPrefab(BlendInBootstrapAssets assets)
    {
        var root = new GameObject("Player");
        root.AddComponent<CharacterController>();
        root.AddComponent<PlayerController>();
        root.AddComponent<SuspicionSystem>();
        root.AddComponent<PlayerDisguise>();
        var variation = root.AddComponent<CharacterVariation>();
        var outfitSwap = root.AddComponent<DisguiseOutfitSwap>();

        var visual = CreatePrimitiveVisual("Body", PrimitiveType.Capsule, root.transform, assets.PlayerMaterial, new Vector3(0f, 1f, 0f), new Vector3(0.85f, 1.05f, 0.85f));
        variation.bodyVariants = new[] { visual };
        variation.tintRenderers = new[] { visual.GetComponent<Renderer>() };
        outfitSwap.targetVariation = variation;
        outfitSwap.disguiseOutfits = assets.Outfits;

        var prefab = SaveAsPrefab(root, PrefabRoot + "/Player.prefab");
        Object.DestroyImmediate(root);
        return prefab;
    }

    private static GameObject CreateHunterPrefab(BlendInBootstrapAssets assets)
    {
        var root = new GameObject("Hunter");
        var agent = root.AddComponent<NavMeshAgent>();
        agent.radius = 0.35f;
        agent.height = 1.9f;
        agent.speed = assets.HunterConfig != null ? assets.HunterConfig.patrolSpeed : 3f;
        agent.angularSpeed = 720f;
        agent.acceleration = 14f;

        var hunter = root.AddComponent<HunterAI>();
        hunter.config = assets.HunterConfig;
        var detection = root.AddComponent<DetectionSystem>();

        var viewOrigin = new GameObject("ViewOrigin").transform;
        viewOrigin.SetParent(root.transform);
        viewOrigin.localPosition = new Vector3(0f, 1.6f, 0f);
        detection.viewOrigin = viewOrigin;

        CreatePrimitiveVisual("Body", PrimitiveType.Cylinder, root.transform, assets.HunterMaterial, new Vector3(0f, 1f, 0f), new Vector3(0.8f, 1f, 0.8f));

        var prefab = SaveAsPrefab(root, PrefabRoot + "/Hunter.prefab");
        Object.DestroyImmediate(root);
        return prefab;
    }

    private static GameObject CreatePrimitiveVisual(string name, PrimitiveType primitiveType, Transform parent, Material material, Vector3 localPosition, Vector3 localScale)
    {
        var primitive = GameObject.CreatePrimitive(primitiveType);
        primitive.name = name;
        primitive.transform.SetParent(parent);
        primitive.transform.localPosition = localPosition;
        primitive.transform.localRotation = Quaternion.identity;
        primitive.transform.localScale = localScale;

        var collider = primitive.GetComponent<Collider>();
        if (collider != null)
        {
            Object.DestroyImmediate(collider);
        }

        var renderer = primitive.GetComponent<Renderer>();
        if (renderer != null && material != null)
        {
            renderer.sharedMaterial = material;
        }

        return primitive;
    }

    private static Material CreateOrUpdateMaterial(string path, Color color)
    {
        var material = AssetDatabase.LoadAssetAtPath<Material>(path);
        if (material == null)
        {
            material = new Material(FindPrototypeShader());
            AssetDatabase.CreateAsset(material, path);
        }

        material.color = color;
        material.SetColor("_Color", color);
        material.SetColor("_BaseColor", color);
        EditorUtility.SetDirty(material);
        return material;
    }

    private static Shader FindPrototypeShader()
    {
        var hasActiveRenderPipeline = GraphicsSettings.currentRenderPipeline != null || GraphicsSettings.defaultRenderPipeline != null;
        if (hasActiveRenderPipeline)
        {
            return Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard");
        }

        return Shader.Find("Standard");
    }

    private static T CreateOrUpdateAsset<T>(string path, System.Action<T> configure) where T : ScriptableObject
    {
        var asset = AssetDatabase.LoadAssetAtPath<T>(path);
        if (asset == null)
        {
            asset = ScriptableObject.CreateInstance<T>();
            AssetDatabase.CreateAsset(asset, path);
        }

        configure?.Invoke(asset);
        EditorUtility.SetDirty(asset);
        return asset;
    }

    private static GameObject SaveAsPrefab(GameObject root, string path)
    {
        var prefab = PrefabUtility.SaveAsPrefabAsset(root, path);
        return prefab != null ? prefab : AssetDatabase.LoadAssetAtPath<GameObject>(path);
    }

    private static ScheduleTable.ScheduleSlot Slot(float hour, params ScheduleTable.ScheduleOption[] options)
    {
        return new ScheduleTable.ScheduleSlot
        {
            gameHour = hour,
            options = options
        };
    }

    private static ScheduleTable.ScheduleOption Option(string destination, float probability, TransportMode transport, float waitSeconds = 0f)
    {
        return new ScheduleTable.ScheduleOption
        {
            destinationTag = destination,
            probability = probability,
            transport = transport,
            waitSeconds = waitSeconds
        };
    }

    private static Text CreateTextElement(string name, Transform parent, string text, int fontSize, TextAnchor alignment)
    {
        var go = new GameObject(name, typeof(RectTransform), typeof(Text));
        go.transform.SetParent(parent, false);
        var label = go.GetComponent<Text>();
        label.text = text;
        label.fontSize = fontSize;
        label.color = Color.white;
        label.alignment = alignment;
        label.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
        label.horizontalOverflow = HorizontalWrapMode.Wrap;
        label.verticalOverflow = VerticalWrapMode.Truncate;

        return label;
    }

    private static Image CreateImageElement(string name, Transform parent, Color color)
    {
        var go = new GameObject(name, typeof(RectTransform), typeof(Image));
        go.transform.SetParent(parent, false);
        var image = go.GetComponent<Image>();
        image.color = color;
        return image;
    }

    private static Button CreateButtonElement(string name, Transform parent, Color color)
    {
        var go = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(Button));
        go.transform.SetParent(parent, false);
        var image = go.GetComponent<Image>();
        image.color = color;
        return go.GetComponent<Button>();
    }

    private static void Stretch(RectTransform rectTransform, Vector2 anchorMin, Vector2 anchorMax, Vector2 anchoredPosition, Vector2 sizeDelta)
    {
        rectTransform.anchorMin = anchorMin;
        rectTransform.anchorMax = anchorMax;
        rectTransform.anchoredPosition = anchoredPosition;
        rectTransform.sizeDelta = sizeDelta;
    }
}
#endif
