using UnityEngine;
using UnityEngine.UI;

public class DisguiseUI : MonoBehaviour
{
    public PlayerDisguise playerDisguise;
    public Button disguiseButton;
    public Image progressFill;
    public Text chargesLabel;

    private void Start()
    {
        if (playerDisguise == null)
        {
            playerDisguise = FindFirstObjectByType<PlayerDisguise>();
        }

        if (disguiseButton != null)
        {
            disguiseButton.onClick.AddListener(HandleDisguiseClicked);
        }

        if (playerDisguise != null)
        {
            playerDisguise.ProgressChanged += UpdateProgress;
            playerDisguise.ChargesChanged += UpdateCharges;
            playerDisguise.DisguiseStateChanged += UpdateButtonState;
            UpdateCharges(playerDisguise.remainingDisguises);
            UpdateProgress(0f);
        }
    }

    private void OnDestroy()
    {
        if (disguiseButton != null)
        {
            disguiseButton.onClick.RemoveListener(HandleDisguiseClicked);
        }

        if (playerDisguise == null)
        {
            return;
        }

        playerDisguise.ProgressChanged -= UpdateProgress;
        playerDisguise.ChargesChanged -= UpdateCharges;
        playerDisguise.DisguiseStateChanged -= UpdateButtonState;
    }

    private void HandleDisguiseClicked()
    {
        playerDisguise?.TryStartDisguise();
    }

    private void UpdateProgress(float progress)
    {
        if (progressFill != null)
        {
            progressFill.fillAmount = progress;
        }
    }

    private void UpdateCharges(int charges)
    {
        if (chargesLabel != null)
        {
            chargesLabel.text = $"Disguise x{charges}";
        }
    }

    private void UpdateButtonState(bool isDisguising)
    {
        if (disguiseButton != null)
        {
            disguiseButton.interactable = !isDisguising;
        }
    }
}
