function SoundSlider({ icon, label, value, onChange }) {
  return (
    <label className="sound-slider">
      <span>
        {icon}
        {label}
      </span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export default SoundSlider;
