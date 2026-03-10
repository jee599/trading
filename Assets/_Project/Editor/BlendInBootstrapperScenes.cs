#if UNITY_EDITOR
using System.Reflection;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public static partial class BlendInBootstrapper
{
    private static void CreateScenes(BlendInBootstrapAssets assets)
    {
        CreateMainMenuScene();
        CreateResultScene();
        CreateGameScene(assets);
    }

    private static void CreateMainMenuScene()
    {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

        CreateDirectionalLight();
        CreateStaticCamera(new Vector3(0f, 14f, -18f), new Vector3(18f, 0f, 0f));
        CreatePrimitiveGround(new Vector3(0f, 0f, 0f), Vector3.one * 3f, Color.gray);

        var canvas = CreateCanvas("MainMenuCanvas");
        var title = CreateTextElement("Title", canvas.transform, "BLEND IN", 52, TextAnchor.MiddleCenter);
        Stretch((RectTransform)title.transform, new Vector2(0.5f, 0.75f), new Vector2(0.5f, 0.75f), Vector2.zero, new Vector2(600f, 100f));

        var body = CreateTextElement("Body", canvas.transform, "Use Blend In/Bootstrap Prototype to rebuild the sample scenes.", 24, TextAnchor.MiddleCenter);
        Stretch((RectTransform)body.transform, new Vector2(0.5f, 0.62f), new Vector2(0.5f, 0.62f), Vector2.zero, new Vector2(900f, 80f));

        EditorSceneManager.SaveScene(scene, SceneRoot + "/MainMenu.unity");
    }

    private static void CreateResultScene()
    {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

        CreateDirectionalLight();
        CreateStaticCamera(new Vector3(0f, 12f, -16f), new Vector3(20f, 0f, 0f));
        CreatePrimitiveGround(new Vector3(0f, 0f, 0f), Vector3.one * 2f, Color.gray);

        var canvas = CreateCanvas("ResultCanvas");
        var title = CreateTextElement("Title", canvas.transform, "Result Scene Placeholder", 42, TextAnchor.MiddleCenter);
        Stretch((RectTransform)title.transform, new Vector2(0.5f, 0.70f), new Vector2(0.5f, 0.70f), Vector2.zero, new Vector2(900f, 80f));

        var body = CreateTextElement("Body", canvas.transform, "GameOverUI currently displays inside GameScene. Use this scene later for flow polish.", 22, TextAnchor.MiddleCenter);
        Stretch((RectTransform)body.transform, new Vector2(0.5f, 0.58f), new Vector2(0.5f, 0.58f), Vector2.zero, new Vector2(1000f, 80f));

        EditorSceneManager.SaveScene(scene, SceneRoot + "/ResultScene.unity");
    }

    private static void CreateGameScene(BlendInBootstrapAssets assets)
    {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

        var environmentRoot = new GameObject("Environment").transform;
        var markerRoot = new GameObject("WorldMarkers").transform;
        var routeRoot = new GameObject("HunterRoute").transform;

        CreateDirectionalLight();
        CreateGrayboxMap(assets, environmentRoot, markerRoot);

        var player = (GameObject)PrefabUtility.InstantiatePrefab(assets.PlayerPrefab);
        player.name = "Player";
        player.transform.position = new Vector3(-52f, 0.05f, 56f);

        var hunter = (GameObject)PrefabUtility.InstantiatePrefab(assets.HunterPrefab);
        hunter.name = "Hunter";
        hunter.transform.position = new Vector3(0f, 0.05f, 12f);

        var camera = CreateFollowCamera(player.transform);
        var playerController = player.GetComponent<PlayerController>();
        playerController.cameraPivot = camera.transform;

        var systemsRoot = new GameObject("_Systems").transform;
        var gameManager = new GameObject("GameManager").AddComponent<GameManager>();
        gameManager.transform.SetParent(systemsRoot);
        var timeManager = new GameObject("TimeManager").AddComponent<TimeManager>();
        timeManager.transform.SetParent(systemsRoot);
        var scoreManager = new GameObject("ScoreManager").AddComponent<ScoreManager>();
        scoreManager.transform.SetParent(systemsRoot);
        var eventManager = new GameObject("EventManager").AddComponent<EventManager>();
        eventManager.transform.SetParent(systemsRoot);
        var missionManager = new GameObject("MissionManager").AddComponent<MissionManager>();
        missionManager.transform.SetParent(systemsRoot);
        var relationshipManager = new GameObject("RelationshipManager").AddComponent<RelationshipManager>();
        relationshipManager.transform.SetParent(systemsRoot);
        var citizenSpawner = new GameObject("CitizenSpawner").AddComponent<CitizenSpawner>();
        citizenSpawner.transform.SetParent(systemsRoot);

        eventManager.availableEvents = assets.Events;
        missionManager.missionPool = assets.Missions;
        citizenSpawner.citizenPrefab = assets.CitizenPrefab;
        citizenSpawner.archetypes = assets.Archetypes;

        var routePoints = CreateHunterRoute(routeRoot);
        var hunterAi = hunter.GetComponent<HunterAI>();
        hunterAi.patrolRoute = routePoints;
        hunterAi.config = assets.HunterConfig;

        BuildGameplayUI(player, missionManager);
        TryBuildNavMesh();

        EditorSceneManager.SaveScene(scene, SceneRoot + "/GameScene.unity");
    }

    private static void CreateGrayboxMap(BlendInBootstrapAssets assets, Transform environmentRoot, Transform markerRoot)
    {
        CreatePrimitiveGround(Vector3.zero, Vector3.one * 20f, new Color(0.36f, 0.56f, 0.32f), assets.GroundMaterial).transform.SetParent(environmentRoot);

        CreateRoad(environmentRoot, new Vector3(0f, 0.02f, 14f), new Vector3(18f, 0.05f, 2f));
        CreateRoad(environmentRoot, new Vector3(22f, 0.02f, -10f), new Vector3(2f, 0.05f, 18f));
        CreateRoad(environmentRoot, new Vector3(-22f, 0.02f, -4f), new Vector3(2f, 0.05f, 14f));

        CreateBuilding(environmentRoot, "Apartment_A", new Vector3(-60f, 6f, 56f), new Vector3(14f, 12f, 14f), assets.BuildingMaterial);
        CreateBuilding(environmentRoot, "Apartment_B", new Vector3(-42f, 5f, 58f), new Vector3(12f, 10f, 12f), assets.BuildingMaterial);
        CreateBuilding(environmentRoot, "Apartment_C", new Vector3(-24f, 6f, 56f), new Vector3(14f, 12f, 14f), assets.BuildingMaterial);
        CreateBuilding(environmentRoot, "School", new Vector3(60f, 8f, 56f), new Vector3(18f, 16f, 18f), assets.BuildingMaterial);
        CreateBuilding(environmentRoot, "Office", new Vector3(52f, 7f, 30f), new Vector3(20f, 14f, 16f), assets.BuildingMaterial);
        CreateBuilding(environmentRoot, "Cafe", new Vector3(-56f, 4f, 16f), new Vector3(12f, 8f, 10f), assets.BuildingMaterial);
        CreateBuilding(environmentRoot, "Convenience", new Vector3(-40f, 4f, 16f), new Vector3(10f, 8f, 10f), assets.BuildingMaterial);
        CreateBuilding(environmentRoot, "Restaurant", new Vector3(-22f, 4f, 16f), new Vector3(14f, 8f, 12f), assets.BuildingMaterial);
        CreateBuilding(environmentRoot, "Shop", new Vector3(-46f, 4f, 0f), new Vector3(12f, 8f, 10f), assets.BuildingMaterial);

        CreatePlaza(environmentRoot, assets.BuildingMaterial);
        CreatePark(environmentRoot, assets.BuildingMaterial);

        CreateDestination(markerRoot, "Home_01", "Home", new Vector3(-60f, 0f, 48f));
        CreateDestination(markerRoot, "Home_02", "Home", new Vector3(-42f, 0f, 48f));
        CreateDestination(markerRoot, "Home_03", "Home", new Vector3(-24f, 0f, 48f));
        CreateDestination(markerRoot, "School", "School", new Vector3(60f, 0f, 44f), crowdZone: true);
        CreateDestination(markerRoot, "Office", "Office", new Vector3(52f, 0f, 18f), crowdZone: true);
        CreateDestination(markerRoot, "Cafe", "Cafe", new Vector3(-56f, 0f, 8f), shelter: true, crowdZone: true);
        CreateDestination(markerRoot, "Convenience", "Convenience", new Vector3(-40f, 0f, 8f), shelter: true);
        CreateDestination(markerRoot, "Restaurant", "Restaurant", new Vector3(-22f, 0f, 8f), shelter: true, crowdZone: true);
        CreateDestination(markerRoot, "Shop", "Shop", new Vector3(-46f, 0f, -8f), shelter: true);
        CreateDestination(markerRoot, "Plaza", "Plaza", new Vector3(0f, 0f, 0f), crowdZone: true);
        CreateDestination(markerRoot, "Performance", "Performance", new Vector3(8f, 0f, 0f), crowdZone: true);
        CreateDestination(markerRoot, "Park", "Park", new Vector3(44f, 0f, -46f), crowdZone: true);
        CreateDestination(markerRoot, "Bench", "Bench", new Vector3(52f, 0f, -44f), crowdZone: true, createSitPoint: true);
        CreateDestination(markerRoot, "BusStop", "BusStop", new Vector3(74f, 0f, 16f), crowdZone: true);
        CreateDestination(markerRoot, "Shelter", "Shelter", new Vector3(-52f, 0f, 10f), shelter: true);
        CreateDestination(markerRoot, "Vendor", "Vendor", new Vector3(-8f, 0f, 8f), crowdZone: true);
        CreateDestination(markerRoot, "Patrol", "Patrol", new Vector3(18f, 0f, 22f));
        CreateDestination(markerRoot, "Accident", "Accident", new Vector3(18f, 0f, 14f), crowdZone: true);
        CreateDestination(markerRoot, "SideStreet", "SideStreet", new Vector3(-70f, 0f, 24f), shelter: true);
        CreateDestination(markerRoot, "Exit", "Exit", new Vector3(-76f, 0f, -62f));

        CreateSpawnZone(markerRoot, "Home_Spawn_A", "Home", new Vector3(-60f, 0f, 62f), new Vector3(10f, 1f, 10f));
        CreateSpawnZone(markerRoot, "Home_Spawn_B", "Home", new Vector3(-42f, 0f, 62f), new Vector3(10f, 1f, 10f));
        CreateSpawnZone(markerRoot, "Home_Spawn_C", "Home", new Vector3(-24f, 0f, 62f), new Vector3(10f, 1f, 10f));
        CreateSpawnZone(markerRoot, "Restaurant_Spawn", "Restaurant", new Vector3(-20f, 0f, 20f), new Vector3(8f, 1f, 8f));
        CreateSpawnZone(markerRoot, "Shop_Spawn", "Shop", new Vector3(-46f, 0f, 2f), new Vector3(8f, 1f, 8f));
        CreateSpawnZone(markerRoot, "Park_Spawn", "Park", new Vector3(34f, 0f, -54f), new Vector3(10f, 1f, 10f));
        CreateSpawnZone(markerRoot, "Patrol_Spawn", "Patrol", new Vector3(22f, 0f, 18f), new Vector3(6f, 1f, 6f));
        CreateSpawnZone(markerRoot, "Vendor_Spawn", "Vendor", new Vector3(-10f, 0f, 4f), new Vector3(6f, 1f, 6f));

        CreateMissionTrigger(markerRoot, "CafeTrigger", "Cafe", new Vector3(-56f, 1f, 8f), new Vector3(10f, 2f, 10f), true);
        CreateMissionTrigger(markerRoot, "BusStopTrigger", "BusStop", new Vector3(74f, 1f, 16f), new Vector3(8f, 2f, 8f), false);
        CreateMissionTrigger(markerRoot, "BenchTrigger", "Bench", new Vector3(52f, 1f, -44f), new Vector3(8f, 2f, 8f), false);
    }

    private static Transform[] CreateHunterRoute(Transform parent)
    {
        var positions = new[]
        {
            new Vector3(-18f, 0f, 10f),
            new Vector3(14f, 0f, 12f),
            new Vector3(38f, 0f, 20f),
            new Vector3(64f, 0f, 16f),
            new Vector3(28f, 0f, -8f),
            new Vector3(-6f, 0f, -6f)
        };

        var points = new Transform[positions.Length];
        for (var i = 0; i < positions.Length; i++)
        {
            var point = new GameObject("PatrolPoint_" + i).transform;
            point.SetParent(parent);
            point.position = positions[i];
            points[i] = point;
        }

        return points;
    }

    private static Camera CreateFollowCamera(Transform target)
    {
        var cameraObject = new GameObject("Main Camera", typeof(Camera), typeof(AudioListener), typeof(CameraFollow));
        cameraObject.tag = "MainCamera";
        var camera = cameraObject.GetComponent<Camera>();
        camera.backgroundColor = new Color(0.66f, 0.82f, 0.94f);
        camera.clearFlags = CameraClearFlags.SolidColor;

        var follow = cameraObject.GetComponent<CameraFollow>();
        follow.target = target;
        follow.offset = new Vector3(0f, 16f, -14f);
        follow.positionLerp = 5f;
        follow.rotationLerp = 6f;
        return camera;
    }

    private static void BuildGameplayUI(GameObject player, MissionManager missionManager)
    {
        var playerDisguise = player.GetComponent<PlayerDisguise>();
        var suspicion = player.GetComponent<SuspicionSystem>();

        CreateEventSystem();
        var canvas = CreateCanvas("HUD");

        var timerRoot = new GameObject("TimerUI", typeof(RectTransform), typeof(TimerUI));
        timerRoot.transform.SetParent(canvas.transform, false);
        var timerText = CreateTextElement("Label", timerRoot.transform, "Timer 03:00", 28, TextAnchor.MiddleCenter);
        Stretch((RectTransform)timerRoot.transform, new Vector2(0f, 1f), new Vector2(0f, 1f), new Vector2(120f, -40f), new Vector2(220f, 50f));
        Stretch((RectTransform)timerText.transform, new Vector2(0f, 0f), new Vector2(1f, 1f), Vector2.zero, Vector2.zero);
        timerRoot.GetComponent<TimerUI>().timerLabel = timerText;

        var missionRoot = new GameObject("MissionUI", typeof(RectTransform), typeof(MissionUI));
        missionRoot.transform.SetParent(canvas.transform, false);
        Stretch((RectTransform)missionRoot.transform, new Vector2(0f, 0f), new Vector2(0f, 0f), new Vector2(180f, 140f), new Vector2(320f, 90f));
        var missionBg = CreateImageElement("Background", missionRoot.transform, new Color(0f, 0f, 0f, 0.35f));
        Stretch((RectTransform)missionBg.transform, new Vector2(0f, 0f), new Vector2(1f, 1f), Vector2.zero, Vector2.zero);
        var missionText = CreateTextElement("Label", missionRoot.transform, "Mission: --", 22, TextAnchor.UpperLeft);
        Stretch((RectTransform)missionText.transform, new Vector2(0f, 0f), new Vector2(1f, 1f), new Vector2(14f, -10f), new Vector2(-28f, -28f));
        var missionProgressBg = CreateImageElement("ProgressBg", missionRoot.transform, new Color(1f, 1f, 1f, 0.12f));
        Stretch((RectTransform)missionProgressBg.transform, new Vector2(0f, 0f), new Vector2(1f, 0f), new Vector2(0f, 12f), new Vector2(-24f, 12f));
        var missionProgressFill = CreateImageElement("ProgressFill", missionProgressBg.transform, new Color(0.25f, 0.80f, 0.50f, 0.95f));
        missionProgressFill.type = Image.Type.Filled;
        missionProgressFill.fillMethod = Image.FillMethod.Horizontal;
        Stretch((RectTransform)missionProgressFill.transform, new Vector2(0f, 0f), new Vector2(1f, 1f), Vector2.zero, Vector2.zero);
        var missionUi = missionRoot.GetComponent<MissionUI>();
        missionUi.missionManager = missionManager;
        missionUi.missionLabel = missionText;
        missionUi.progressFill = missionProgressFill;

        var suspicionRoot = new GameObject("SuspicionUI", typeof(RectTransform), typeof(SuspicionMeterUI));
        suspicionRoot.transform.SetParent(canvas.transform, false);
        Stretch((RectTransform)suspicionRoot.transform, new Vector2(0.5f, 0f), new Vector2(0.5f, 0f), new Vector2(0f, 112f), new Vector2(360f, 52f));
        var suspicionBg = CreateImageElement("Background", suspicionRoot.transform, new Color(0f, 0f, 0f, 0.35f));
        Stretch((RectTransform)suspicionBg.transform, new Vector2(0f, 0f), new Vector2(1f, 1f), Vector2.zero, Vector2.zero);
        var suspicionFill = CreateImageElement("Fill", suspicionBg.transform, new Color(0.90f, 0.80f, 0.10f, 0.95f));
        suspicionFill.type = Image.Type.Filled;
        suspicionFill.fillMethod = Image.FillMethod.Horizontal;
        suspicionFill.fillAmount = 0f;
        Stretch((RectTransform)suspicionFill.transform, new Vector2(0f, 0f), new Vector2(1f, 1f), Vector2.zero, Vector2.zero);
        var suspicionLabel = CreateTextElement("Value", suspicionRoot.transform, "Suspicion 0", 22, TextAnchor.MiddleCenter);
        Stretch((RectTransform)suspicionLabel.transform, new Vector2(0f, 0f), new Vector2(1f, 1f), Vector2.zero, Vector2.zero);
        var suspicionUi = suspicionRoot.GetComponent<SuspicionMeterUI>();
        suspicionUi.suspicionSystem = suspicion;
        suspicionUi.fillImage = suspicionFill;
        suspicionUi.valueLabel = suspicionLabel;
        suspicionUi.fillGradient = CreateSuspicionGradient();

        var disguiseButton = CreateButtonElement("DisguiseButton", canvas.transform, new Color(0.12f, 0.22f, 0.32f, 0.85f));
        Stretch((RectTransform)disguiseButton.transform, new Vector2(1f, 0f), new Vector2(1f, 0f), new Vector2(-100f, 170f), new Vector2(150f, 72f));
        var disguiseLabel = CreateTextElement("Label", disguiseButton.transform, "Disguise", 22, TextAnchor.MiddleCenter);
        Stretch((RectTransform)disguiseLabel.transform, new Vector2(0f, 0f), new Vector2(1f, 1f), new Vector2(0f, 14f), new Vector2(-12f, -22f));
        var disguiseProgress = CreateImageElement("Progress", disguiseButton.transform, new Color(0.20f, 0.75f, 0.45f, 0.9f));
        disguiseProgress.type = Image.Type.Filled;
        disguiseProgress.fillMethod = Image.FillMethod.Horizontal;
        Stretch((RectTransform)disguiseProgress.transform, new Vector2(0f, 0f), new Vector2(1f, 0f), new Vector2(0f, 8f), new Vector2(-20f, 10f));
        var disguiseCharges = CreateTextElement("Charges", disguiseButton.transform, "Disguise x3", 18, TextAnchor.MiddleCenter);
        Stretch((RectTransform)disguiseCharges.transform, new Vector2(0f, 0f), new Vector2(1f, 1f), new Vector2(0f, -14f), new Vector2(-12f, -24f));
        var disguiseUiGo = new GameObject("DisguiseUI", typeof(RectTransform), typeof(DisguiseUI));
        disguiseUiGo.transform.SetParent(canvas.transform, false);
        var disguiseUi = disguiseUiGo.GetComponent<DisguiseUI>();
        disguiseUi.playerDisguise = playerDisguise;
        disguiseUi.disguiseButton = disguiseButton;
        disguiseUi.progressFill = disguiseProgress;
        disguiseUi.chargesLabel = disguiseCharges;

        var minimapButton = CreateButtonElement("MinimapButton", canvas.transform, new Color(0.05f, 0.08f, 0.10f, 0.75f));
        Stretch((RectTransform)minimapButton.transform, new Vector2(1f, 1f), new Vector2(1f, 1f), new Vector2(-110f, -72f), new Vector2(190f, 190f));
        var minimapText = CreateTextElement("Label", minimapButton.transform, "MINIMAP", 20, TextAnchor.MiddleCenter);
        Stretch((RectTransform)minimapText.transform, new Vector2(0f, 0f), new Vector2(1f, 1f), Vector2.zero, Vector2.zero);
        var minimapUiGo = new GameObject("MinimapUI", typeof(RectTransform), typeof(MinimapUI));
        minimapUiGo.transform.SetParent(canvas.transform, false);
        var minimapUi = minimapUiGo.GetComponent<MinimapUI>();
        minimapUi.minimapRoot = (RectTransform)minimapButton.transform;
        minimapUi.toggleButton = minimapButton;

        var gameOverOverlay = CreateImageElement("GameOverOverlay", canvas.transform, new Color(0f, 0f, 0f, 0.7f));
        Stretch((RectTransform)gameOverOverlay.transform, new Vector2(0f, 0f), new Vector2(1f, 1f), Vector2.zero, Vector2.zero);
        var gameOverTitle = CreateTextElement("Title", gameOverOverlay.transform, "Caught", 46, TextAnchor.MiddleCenter);
        Stretch((RectTransform)gameOverTitle.transform, new Vector2(0.5f, 0.65f), new Vector2(0.5f, 0.65f), Vector2.zero, new Vector2(700f, 80f));
        var gameOverScore = CreateTextElement("Score", gameOverOverlay.transform, "Score 0", 30, TextAnchor.MiddleCenter);
        Stretch((RectTransform)gameOverScore.transform, new Vector2(0.5f, 0.54f), new Vector2(0.5f, 0.54f), Vector2.zero, new Vector2(500f, 60f));
        var gameOverSummary = CreateTextElement("Summary", gameOverOverlay.transform, "Summary", 22, TextAnchor.MiddleCenter);
        Stretch((RectTransform)gameOverSummary.transform, new Vector2(0.5f, 0.46f), new Vector2(0.5f, 0.46f), Vector2.zero, new Vector2(800f, 60f));
        var gameOverUiGo = new GameObject("GameOverUI", typeof(RectTransform), typeof(GameOverUI));
        gameOverUiGo.transform.SetParent(canvas.transform, false);
        var gameOverUi = gameOverUiGo.GetComponent<GameOverUI>();
        gameOverUi.root = gameOverOverlay.gameObject;
        gameOverUi.titleLabel = gameOverTitle;
        gameOverUi.scoreLabel = gameOverScore;
        gameOverUi.summaryLabel = gameOverSummary;
        gameOverOverlay.gameObject.SetActive(false);

        CreateJoystick(canvas.transform);
    }

    private static Canvas CreateCanvas(string name)
    {
        var canvasGo = new GameObject(name, typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
        var canvas = canvasGo.GetComponent<Canvas>();
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;
        canvas.pixelPerfect = false;

        var scaler = canvasGo.GetComponent<CanvasScaler>();
        scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        scaler.referenceResolution = new Vector2(1920f, 1080f);
        scaler.matchWidthOrHeight = 0.5f;
        return canvas;
    }

    private static void CreateEventSystem()
    {
        if (Object.FindFirstObjectByType<EventSystem>() != null)
        {
            return;
        }

        new GameObject("EventSystem", typeof(EventSystem), typeof(StandaloneInputModule));
    }

    private static void CreateJoystick(Transform canvas)
    {
        var joystickRoot = new GameObject("JoystickUI", typeof(RectTransform), typeof(JoystickUI));
        joystickRoot.transform.SetParent(canvas, false);
        Stretch((RectTransform)joystickRoot.transform, Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero);
        var background = CreateImageElement("Background", joystickRoot.transform, new Color(0f, 0f, 0f, 0.28f));
        background.raycastTarget = true;
        Stretch((RectTransform)background.transform, new Vector2(0f, 0f), new Vector2(0f, 0f), new Vector2(140f, 140f), new Vector2(180f, 180f));
        var handle = CreateImageElement("Handle", background.transform, new Color(1f, 1f, 1f, 0.75f));
        handle.raycastTarget = false;
        Stretch((RectTransform)handle.transform, new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f), Vector2.zero, new Vector2(72f, 72f));

        var joystick = joystickRoot.GetComponent<JoystickUI>();
        joystick.background = (RectTransform)background.transform;
        joystick.handle = (RectTransform)handle.transform;
        joystick.maxRadius = 70f;
    }

    private static Gradient CreateSuspicionGradient()
    {
        var gradient = new Gradient();
        gradient.SetKeys(
            new[]
            {
                new GradientColorKey(new Color(0.25f, 0.85f, 0.45f), 0f),
                new GradientColorKey(new Color(0.95f, 0.80f, 0.15f), 0.5f),
                new GradientColorKey(new Color(0.95f, 0.25f, 0.20f), 1f)
            },
            new[]
            {
                new GradientAlphaKey(1f, 0f),
                new GradientAlphaKey(1f, 1f)
            });
        return gradient;
    }

    private static void CreateDirectionalLight()
    {
        var lightObject = new GameObject("Directional Light", typeof(Light));
        var light = lightObject.GetComponent<Light>();
        light.type = LightType.Directional;
        light.intensity = 1.15f;
        lightObject.transform.rotation = Quaternion.Euler(48f, -32f, 0f);
    }

    private static Camera CreateStaticCamera(Vector3 position, Vector3 rotation)
    {
        var cameraObject = new GameObject("Main Camera", typeof(Camera), typeof(AudioListener));
        cameraObject.tag = "MainCamera";
        cameraObject.transform.position = position;
        cameraObject.transform.rotation = Quaternion.Euler(rotation);
        return cameraObject.GetComponent<Camera>();
    }

    private static GameObject CreatePrimitiveGround(Vector3 position, Vector3 scale, Color color, Material material = null)
    {
        var ground = GameObject.CreatePrimitive(PrimitiveType.Plane);
        ground.name = "Ground";
        ground.transform.position = position;
        ground.transform.localScale = scale;
        var renderer = ground.GetComponent<Renderer>();
        if (material != null)
        {
            renderer.sharedMaterial = material;
        }
        else if (renderer != null)
        {
            renderer.sharedMaterial.color = color;
        }

        return ground;
    }

    private static void CreateRoad(Transform parent, Vector3 position, Vector3 scale)
    {
        var road = GameObject.CreatePrimitive(PrimitiveType.Cube);
        road.name = "Road";
        road.transform.SetParent(parent);
        road.transform.position = position;
        road.transform.localScale = scale;
        var renderer = road.GetComponent<Renderer>();
        if (renderer != null)
        {
            renderer.sharedMaterial = CreateOrUpdateMaterial(MaterialRoot + "/Road.mat", new Color(0.22f, 0.23f, 0.25f));
        }
    }

    private static void CreateBuilding(Transform parent, string name, Vector3 position, Vector3 scale, Material material)
    {
        var building = GameObject.CreatePrimitive(PrimitiveType.Cube);
        building.name = name;
        building.transform.SetParent(parent);
        building.transform.position = position;
        building.transform.localScale = scale;
        var renderer = building.GetComponent<Renderer>();
        if (renderer != null && material != null)
        {
            renderer.sharedMaterial = material;
        }
    }

    private static void CreatePlaza(Transform parent, Material material)
    {
        var plaza = GameObject.CreatePrimitive(PrimitiveType.Cube);
        plaza.name = "Plaza";
        plaza.transform.SetParent(parent);
        plaza.transform.position = new Vector3(0f, 0.1f, 0f);
        plaza.transform.localScale = new Vector3(28f, 0.2f, 28f);
        var renderer = plaza.GetComponent<Renderer>();
        if (renderer != null)
        {
            renderer.sharedMaterial = material;
        }
    }

    private static void CreatePark(Transform parent, Material material)
    {
        var park = GameObject.CreatePrimitive(PrimitiveType.Cube);
        park.name = "Park";
        park.transform.SetParent(parent);
        park.transform.position = new Vector3(44f, 0.08f, -46f);
        park.transform.localScale = new Vector3(32f, 0.16f, 26f);
        var renderer = park.GetComponent<Renderer>();
        if (renderer != null)
        {
            renderer.sharedMaterial = material;
        }
    }

    private static void CreateDestination(Transform parent, string name, string zoneTag, Vector3 position, bool shelter = false, bool crowdZone = false, bool createSitPoint = false)
    {
        var root = new GameObject(name);
        root.transform.SetParent(parent);
        root.transform.position = position;

        var point = root.AddComponent<DestinationPoint>();
        point.zoneTag = zoneTag;
        point.countsAsShelter = shelter;
        point.countsAsCrowdZone = crowdZone;

        var marker = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        marker.name = "Marker";
        marker.transform.SetParent(root.transform);
        marker.transform.localPosition = new Vector3(0f, 0.4f, 0f);
        marker.transform.localScale = Vector3.one * 0.8f;
        var markerCollider = marker.GetComponent<Collider>();
        if (markerCollider != null)
        {
            Object.DestroyImmediate(markerCollider);
        }

        var standPoints = new Transform[4];
        for (var i = 0; i < standPoints.Length; i++)
        {
            var stand = new GameObject("Stand_" + i).transform;
            stand.SetParent(root.transform);
            var angle = Mathf.Deg2Rad * (90f * i);
            stand.localPosition = new Vector3(Mathf.Cos(angle) * 1.5f, 0f, Mathf.Sin(angle) * 1.5f);
            standPoints[i] = stand;
        }

        point.standPoints = standPoints;

        if (createSitPoint)
        {
            var sit = new GameObject("Sit_0").transform;
            sit.SetParent(root.transform);
            sit.localPosition = new Vector3(0f, 0f, 0f);
            point.sitPoints = new[] { sit };
        }
    }

    private static void CreateSpawnZone(Transform parent, string name, string zoneTag, Vector3 position, Vector3 size)
    {
        var root = new GameObject(name);
        root.transform.SetParent(parent);
        root.transform.position = position;
        var zone = root.AddComponent<SpawnZone>();
        zone.zoneTag = zoneTag;
        zone.size = size;
    }

    private static void CreateMissionTrigger(Transform parent, string name, string zoneTag, Vector3 position, Vector3 size, bool sheltered)
    {
        var trigger = new GameObject(name, typeof(BoxCollider), typeof(MissionTrigger));
        trigger.transform.SetParent(parent);
        trigger.transform.position = position;
        var collider = trigger.GetComponent<BoxCollider>();
        collider.isTrigger = true;
        collider.size = size;
        var missionTrigger = trigger.GetComponent<MissionTrigger>();
        missionTrigger.zoneTag = zoneTag;
        missionTrigger.countsAsShelter = sheltered;
    }

    private static void TryBuildNavMesh()
    {
        var navMeshBuilderType = System.Type.GetType("UnityEditor.AI.NavMeshBuilder,UnityEditor");
        var buildMethod = navMeshBuilderType?.GetMethod("BuildNavMesh", BindingFlags.Public | BindingFlags.Static, null, System.Type.EmptyTypes, null);
        buildMethod?.Invoke(null, null);
    }
}
#endif
