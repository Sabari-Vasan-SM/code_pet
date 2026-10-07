import React, { useEffect, useState, useRef } from 'react';
import {
  CodePetConfig,
  ToolStatus,
  DeveloperSessionStats,
  CustomToolConfig,
  PetSpecies,
  PetSkin,
  PetAccessory,
  CodingEventType
} from '../../packages/shared/types';
import { DEFAULT_CONFIG, PET_SPECIES_META, TOOL_REGISTRY } from '../../packages/shared/constants';
import { PixelSpriteEngine } from '../../packages/animation-engine';

// Icon components (crisp inline SVGs for zero bundle issues)
const IconPet = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 4-2.26 5-.74.65.98.54 2.45-.19 3.74.83 1.05 1.25 2.37 1.19 3.74-.18 4.41-3.6 8-8 8s-7.82-3.59-8-8c-.06-1.37.36-2.69 1.19-3.74-.73-1.29-.84-2.76-.19-3.74 1-1.52 3.22-1.26 5 .74.65-.17 1.33-.26 2-.26z"/><circle cx="9" cy="13" r="1"/><circle cx="15" cy="13" r="1"/></svg>
);
const IconPalette = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
);
const IconBrain = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z"/></svg>
);
const IconTools = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
);
const IconSound = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
);
const IconDashboard = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);

// Pet Canvas Preview Component
function PetPreviewCanvas({
  species,
  skin,
  accessory,
  scale = 4
}: {
  species: PetSpecies;
  skin: PetSkin;
  accessory: PetAccessory;
  scale?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spriteEngineRef = useRef(new PixelSpriteEngine());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const spriteFrame = spriteEngineRef.current.getFrame(
        species,
        'IDLE',
        frame,
        skin,
        accessory
      );
      spriteEngineRef.current.drawToCanvas(ctx, spriteFrame, scale, 0, 0);
    };

    const interval = setInterval(() => {
      frame++;
      render();
    }, 300);

    render();

    return () => clearInterval(interval);
  }, [species, skin, accessory, scale]);

  return (
    <canvas
      ref={canvasRef}
      className="preview-canvas"
      width={32 * scale}
      height={32 * scale}
    />
  );
}

export default function App() {
  const [config, setConfig] = useState<CodePetConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<'pet' | 'appearance' | 'behavior' | 'tools' | 'sound' | 'dashboard' | 'privacy'>('pet');
  const [toolStatuses, setToolStatuses] = useState<ToolStatus[]>([]);
  const [sessionStats, setSessionStats] = useState<DeveloperSessionStats | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [savedToast, setSavedToast] = useState(false);

  // Custom tool modal state
  const [showAddTool, setShowAddTool] = useState(false);
  const [newToolName, setNewToolName] = useState('');
  const [newToolCommand, setNewToolCommand] = useState('');

  // Load config on mount
  useEffect(() => {
    const api = (window as any).codePetSettingsApi;
    if (api) {
      api.getConfig().then((loaded: CodePetConfig) => {
        if (loaded) {
          setConfig(loaded);
          if (!loaded.onboardingCompleted) {
            setShowOnboarding(true);
          }
        }
      });

      api.getToolStatuses().then((statuses: ToolStatus[]) => {
        setToolStatuses(statuses || []);
      });

      api.getSessionStats().then((stats: DeveloperSessionStats) => {
        setSessionStats(stats);
      });
    }
  }, []);

  const handleSave = async (updated: CodePetConfig) => {
    setConfig(updated);
    const api = (window as any).codePetSettingsApi;
    if (api) {
      await api.saveConfig(updated);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2000);
    }
  };

  const handleTestEvent = (eventType: CodingEventType) => {
    const api = (window as any).codePetSettingsApi;
    if (api) {
      api.triggerTestEvent(eventType, 'claude-code');
    }
  };

  const handleTestSound = (sound: string) => {
    const api = (window as any).codePetSettingsApi;
    if (api) {
      api.triggerPetInteraction(sound);
    }
  };

  const handleAddCustomTool = async () => {
    if (!newToolName.trim()) return;
    const api = (window as any).codePetSettingsApi;
    const customTool: CustomToolConfig = {
      id: `custom-${Date.now()}`,
      name: newToolName,
      detectionCommand: newToolCommand,
      enabled: true
    };
    if (api) {
      await api.addCustomTool(customTool);
      const statuses = await api.getToolStatuses();
      setToolStatuses(statuses || []);
    }
    setShowAddTool(false);
    setNewToolName('');
    setNewToolCommand('');
  };

  const finishOnboarding = () => {
    const updated = { ...config, onboardingCompleted: true };
    handleSave(updated);
    setShowOnboarding(false);
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">🐾</div>
          <div className="brand-text">
            <h1>CodePet</h1>
            <span>v1.0.0 • Desktop Companion</span>
          </div>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-item ${activeTab === 'pet' ? 'active' : ''}`}
            onClick={() => setActiveTab('pet')}
          >
            <IconPet /> Pet Customization
          </button>
          <button
            className={`nav-item ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            <IconPalette /> Appearance & Skins
          </button>
          <button
            className={`nav-item ${activeTab === 'behavior' ? 'active' : ''}`}
            onClick={() => setActiveTab('behavior')}
          >
            <IconBrain /> Behavior & Mood
          </button>
          <button
            className={`nav-item ${activeTab === 'tools' ? 'active' : ''}`}
            onClick={() => setActiveTab('tools')}
          >
            <IconTools /> Coding Tools ({config.tools.enabledTools.length})
          </button>
          <button
            className={`nav-item ${activeTab === 'sound' ? 'active' : ''}`}
            onClick={() => setActiveTab('sound')}
          >
            <IconSound /> Sound Mixer
          </button>
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <IconDashboard /> Dev Dashboard
          </button>
          <button
            className={`nav-item ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <IconShield /> Privacy & Security
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="status-badge">
            <span className="status-dot"></span> Active & Listening
          </div>
          <button
            className="btn btn-secondary"
            style={{ padding: '4px 8px', fontSize: '11px' }}
            onClick={() => {
              setOnboardingStep(1);
              setShowOnboarding(true);
            }}
          >
            Tutorial
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="content-area">
        {/* TAB 1: PET CUSTOMIZATION */}
        {activeTab === 'pet' && (
          <div>
            <header className="page-header">
              <h2>Pet Profile & Species</h2>
              <p>Choose your companion's identity, personality, and size on your desktop.</p>
            </header>

            <div className="grid-2">
              <div className="card">
                <h3 className="card-title">Live Preview</h3>
                <div className="preview-box">
                  <PetPreviewCanvas
                    species={config.pet.species}
                    skin={config.appearance.skin}
                    accessory={config.appearance.accessory}
                    scale={5}
                  />
                  <div className="preview-badge">{config.pet.name} the {config.pet.species.toUpperCase()}</div>
                </div>

                <div style={{ marginTop: '16px' }} className="form-group">
                  <label className="form-label">Pet Name</label>
                  <input
                    type="text"
                    className="input-text"
                    value={config.pet.name}
                    onChange={(e) => handleSave({ ...config, pet: { ...config.pet, name: e.target.value } })}
                  />
                </div>
              </div>

              <div className="card">
                <h3 className="card-title">Species Selection</h3>
                <div className="form-group">
                  <label className="form-label">Select Character</label>
                  <select
                    className="select-custom"
                    value={config.pet.species}
                    onChange={(e) => handleSave({ ...config, pet: { ...config.pet, species: e.target.value as PetSpecies } })}
                  >
                    {PET_SPECIES_META.map(meta => (
                      <option key={meta.id} value={meta.id}>{meta.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Scale Size</label>
                  <select
                    className="select-custom"
                    value={config.appearance.pixelScale}
                    onChange={(e) => handleSave({ ...config, appearance: { ...config.appearance, pixelScale: parseInt(e.target.value) } })}
                  >
                    <option value={3}>Small (3x Pixel)</option>
                    <option value={4}>Standard (4x Pixel)</option>
                    <option value={5}>Large (5x Pixel)</option>
                    <option value={6}>Extra Large (6x Pixel)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Animation Speed ({config.pet.animationSpeed}x)</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    style={{ width: '100%' }}
                    value={config.pet.animationSpeed}
                    onChange={(e) => handleSave({ ...config, pet: { ...config.pet, animationSpeed: parseFloat(e.target.value) } })}
                  />
                </div>

                <div className="toggle-row">
                  <div>
                    <div className="toggle-label">Always on Top</div>
                    <div className="toggle-sub">Pet hovers above coding windows</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={config.system.alwaysOnTop}
                      onChange={(e) => handleSave({ ...config, system: { ...config.system, alwaysOnTop: e.target.checked } })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-row">
                  <div>
                    <div className="toggle-label">Lock Desktop Position</div>
                    <div className="toggle-sub">Prevents accidental dragging</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={config.system.lockPosition}
                      onChange={(e) => handleSave({ ...config, system: { ...config.system, lockPosition: e.target.checked } })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: APPEARANCE & SKINS */}
        {activeTab === 'appearance' && (
          <div>
            <header className="page-header">
              <h2>Appearance & Accessories</h2>
              <p>Style your pet with custom pixel palettes, stylish hats, and retro accessories.</p>
            </header>

            <div className="grid-2">
              <div className="card">
                <h3 className="card-title">Color Skin Variant</h3>
                <div className="form-group">
                  <label className="form-label">Skin Palette</label>
                  <select
                    className="select-custom"
                    value={config.appearance.skin}
                    onChange={(e) => handleSave({ ...config, appearance: { ...config.appearance, skin: e.target.value as PetSkin } })}
                  >
                    <option value="default">Default Warm</option>
                    <option value="neon">Cyber Neon</option>
                    <option value="pastel">Pastel Dream</option>
                    <option value="retro-monochrome">Game Boy Green</option>
                    <option value="golden">Golden Spark</option>
                    <option value="cyberpunk">Cyberpunk Synthwave</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Accessory</label>
                  <select
                    className="select-custom"
                    value={config.appearance.accessory}
                    onChange={(e) => handleSave({ ...config, appearance: { ...config.appearance, accessory: e.target.value as PetAccessory } })}
                  >
                    <option value="none">None</option>
                    <option value="wizard-hat">🧙 Wizard Hat</option>
                    <option value="top-hat">🎩 Dapper Top Hat</option>
                    <option value="cool-glasses">🕶️ Cool Sunglasses</option>
                    <option value="bowtie">🎀 Bowtie</option>
                    <option value="developer-headset">🎧 Developer Headset</option>
                    <option value="halo">😇 Golden Halo</option>
                  </select>
                </div>

                <div className="toggle-row">
                  <div>
                    <div className="toggle-label">Particle Bursts</div>
                    <div className="toggle-sub">Sparkles, hearts, sweat drops on events</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={config.appearance.particlesEnabled}
                      onChange={(e) => handleSave({ ...config, appearance: { ...config.appearance, particlesEnabled: e.target.checked } })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <div className="card">
                <h3 className="card-title">Styling Preview</h3>
                <div className="preview-box">
                  <PetPreviewCanvas
                    species={config.pet.species}
                    skin={config.appearance.skin}
                    accessory={config.appearance.accessory}
                    scale={5}
                  />
                  <div className="preview-badge">{config.appearance.skin.toUpperCase()} • {config.appearance.accessory.toUpperCase()}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BEHAVIOR & MOOD */}
        {activeTab === 'behavior' && (
          <div>
            <header className="page-header">
              <h2>Behavior & Mood Engine</h2>
              <p>Configure how your pet reacts to your coding, idle duration, and speech balloons.</p>
            </header>

            <div className="card" style={{ marginBottom: '20px' }}>
              <h3 className="card-title">Speech Bubbles</h3>
              <div className="toggle-row">
                <div>
                  <div className="toggle-label">Enable Speech Bubbles</div>
                  <div className="toggle-sub">Display floating dialogue above the pet during events</div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={config.behavior.speechBubblesEnabled}
                    onChange={(e) => handleSave({ ...config, behavior: { ...config.behavior, speechBubblesEnabled: e.target.checked } })}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="form-group" style={{ marginTop: '12px' }}>
                <label className="form-label">Speech Bubble Display Duration ({config.behavior.speechBubbleDurationMs / 1000}s)</label>
                <input
                  type="range"
                  min="1500"
                  max="6000"
                  step="500"
                  style={{ width: '100%' }}
                  value={config.behavior.speechBubbleDurationMs}
                  onChange={(e) => handleSave({ ...config, behavior: { ...config.behavior, speechBubbleDurationMs: parseInt(e.target.value) } })}
                />
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">Sleep & Idle Logic</h3>
              <div className="form-group">
                <label className="form-label">Nap after Inactive Minutes ({config.behavior.sleepAfterInactiveMinutes}m)</label>
                <input
                  type="range"
                  min="3"
                  max="30"
                  step="1"
                  style={{ width: '100%' }}
                  value={config.behavior.sleepAfterInactiveMinutes}
                  onChange={(e) => handleSave({ ...config, behavior: { ...config.behavior, sleepAfterInactiveMinutes: parseInt(e.target.value) } })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Reaction Intensity</label>
                <select
                  className="select-custom"
                  value={config.behavior.reactionIntensity}
                  onChange={(e) => handleSave({ ...config, behavior: { ...config.behavior, reactionIntensity: e.target.value as any } })}
                >
                  <option value="subtle">Subtle (Quiet dev sessions)</option>
                  <option value="normal">Balanced (Default)</option>
                  <option value="expressive">Expressive (Frequent animations & celebrations)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CODING TOOLS */}
        {activeTab === 'tools' && (
          <div>
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2>AI Coding Tool Adapters</h2>
                <p>Seamlessly connects to your AI coding agents, IDEs, and CLI tools locally.</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowAddTool(true)}>
                + Add Custom Tool
              </button>
            </header>

            {/* Test Simulation Buttons */}
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3 className="card-title">Simulate Real-Time Events</h3>
              <p className="card-desc">Click any button below to immediately test pet reactions and sounds:</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" onClick={() => handleTestEvent('BUILD_SUCCESS')}>
                  🟢 Build Success
                </button>
                <button className="btn btn-secondary" onClick={() => handleTestEvent('BUILD_FAILED')}>
                  🔴 Build Failed
                </button>
                <button className="btn btn-secondary" onClick={() => handleTestEvent('TEST_PASSED')}>
                  💚 Tests Passed
                </button>
                <button className="btn btn-secondary" onClick={() => handleTestEvent('THINKING')}>
                  🧠 AI Thinking
                </button>
                <button className="btn btn-secondary" onClick={() => handleTestEvent('GENERATING')}>
                  ⚡ Generating Code
                </button>
                <button className="btn btn-secondary" onClick={() => handleTestEvent('CELEBRATING')}>
                  🎉 Celebrate
                </button>
              </div>
            </div>

            {/* Tool list */}
            <div className="grid-2">
              {TOOL_REGISTRY.map(tool => {
                const isEnabled = config.tools.enabledTools.includes(tool.id);
                return (
                  <div key={tool.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px', color: '#fff' }}>{tool.name}</span>
                        <span style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: isEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                          color: isEnabled ? '#10b981' : '#94a3b8'
                        }}>
                          {isEnabled ? 'Connected' : 'Disabled'}
                        </span>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={(e) => {
                            const newEnabled = e.target.checked
                              ? [...config.tools.enabledTools, tool.id]
                              : config.tools.enabledTools.filter(id => id !== tool.id);
                            handleSave({ ...config, tools: { ...config.tools, enabledTools: newEnabled } });
                          }}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{tool.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: SOUND MIXER */}
        {activeTab === 'sound' && (
          <div>
            <header className="page-header">
              <h2>8-Bit Chiptune Sound Mixer</h2>
              <p>Procedural, subtle sound feedback generated on the fly. Zero audio latency.</p>
            </header>

            <div className="grid-2">
              <div className="card">
                <h3 className="card-title">Sound Profile</h3>
                <div className="toggle-row">
                  <div>
                    <div className="toggle-label">Enable Sound Effects</div>
                    <div className="toggle-sub">Play subtle audio cues for milestones</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={config.sound.enabled}
                      onChange={(e) => handleSave({ ...config, sound: { ...config.sound, enabled: e.target.checked } })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label className="form-label">Master Volume ({Math.round(config.sound.masterVolume * 100)}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    style={{ width: '100%' }}
                    value={config.sound.masterVolume}
                    onChange={(e) => handleSave({ ...config, sound: { ...config.sound, masterVolume: parseFloat(e.target.value) } })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sound Pack</label>
                  <select
                    className="select-custom"
                    value={config.sound.soundPack}
                    onChange={(e) => handleSave({ ...config, sound: { ...config.sound, soundPack: e.target.value as any } })}
                  >
                    <option value="8bit">8-Bit Chiptune (Square wave)</option>
                    <option value="soft">Soft Harmonic (Gentle Sine)</option>
                    <option value="arcade">Retro Arcade (Dynamic pitch slides)</option>
                  </select>
                </div>
              </div>

              <div className="card">
                <h3 className="card-title">Test Audio Cues</h3>
                <p className="card-desc">Click any button below to audition the sound:</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  <button className="btn btn-secondary" onClick={() => handleTestSound('happy')}>
                    🎵 Happy Arpeggio
                  </button>
                  <button className="btn btn-secondary" onClick={() => handleTestSound('dance')}>
                    🎺 Celebration Fanfare
                  </button>
                  <button className="btn btn-secondary" onClick={() => handleTestSound('feed')}>
                    🐟 Munch Sound
                  </button>
                  <button className="btn btn-secondary" onClick={() => handleTestSound('pet')}>
                    ❤️ Purr Vibrato
                  </button>
                  <button className="btn btn-secondary" onClick={() => handleTestSound('sleep')}>
                    💤 Sleep Lullaby
                  </button>
                  <button className="btn btn-secondary" onClick={() => handleTestSound('wake')}>
                    ⚡ Wakeup Chime
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: DEVELOPER DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            <header className="page-header">
              <h2>Developer Companion Dashboard</h2>
              <p>Lightweight, fun session statistics. Completely local and private.</p>
            </header>

            <div className="grid-3" style={{ marginBottom: '20px' }}>
              <div className="card">
                <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Active Coding Session</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#38bdf8', marginTop: '6px' }}>
                  {sessionStats ? `${Math.round(sessionStats.activeCodingMs / 60000)}m` : '12m'}
                </div>
              </div>

              <div className="card">
                <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Prompts Completed</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#a855f7', marginTop: '6px' }}>
                  {sessionStats?.promptsCompleted || 8}
                </div>
              </div>

              <div className="card">
                <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Builds Passed</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981', marginTop: '6px' }}>
                  {sessionStats?.buildsSuccess || 5}
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">Pet Affection & Focus</h3>
              <div style={{ margin: '14px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span>Companion Bond Level</span>
                  <span>{sessionStats?.petAffectionLevel || 75}%</span>
                </div>
                <div style={{ height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${sessionStats?.petAffectionLevel || 75}%`, height: '100%', background: 'linear-gradient(90deg, #38bdf8, #ec4899)' }}></div>
                </div>
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                Affection grows with successful builds, passing test suites, and gentle pet interactions!
              </p>
            </div>
          </div>
        )}

        {/* TAB 7: PRIVACY & PERMISSIONS */}
        {activeTab === 'privacy' && (
          <div>
            <header className="page-header">
              <h2>Privacy & Security Manifest</h2>
              <p>CodePet is 100% local-first and privacy-conscious by design.</p>
            </header>

            <div className="card">
              <h3 className="card-title">🔒 Absolute Privacy Guarantee</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: '#10b981' }}>✓</span>
                  <div>
                    <strong>No Code Uploads:</strong> CodePet never uploads your source code, files, or project directories anywhere.
                  </div>
                </li>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: '#10b981' }}>✓</span>
                  <div>
                    <strong>No Prompt Snooping:</strong> We do not store or transmit your AI prompts, conversations, or chat history.
                  </div>
                </li>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: '#10b981' }}>✓</span>
                  <div>
                    <strong>No Telemetry or Tracking:</strong> There are zero third-party analytics trackers or network beacons.
                  </div>
                </li>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: '#10b981' }}>✓</span>
                  <div>
                    <strong>Local Event Bus:</strong> All events run strictly on your local machine via memory and local sockets.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* Onboarding Wizard Modal */}
      {showOnboarding && (
        <div className="onboarding-overlay">
          <div className="onboarding-card">
            <div className="stepper">
              <div className={`step-indicator ${onboardingStep >= 1 ? 'active' : ''}`}></div>
              <div className={`step-indicator ${onboardingStep >= 2 ? 'active' : ''}`}></div>
              <div className={`step-indicator ${onboardingStep >= 3 ? 'active' : ''}`}></div>
              <div className={`step-indicator ${onboardingStep >= 4 ? 'active' : ''}`}></div>
            </div>

            {onboardingStep === 1 && (
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Meet your coding companion.</h2>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
                  CodePet is a customizable pixel-art pet that lives right on your desktop and reacts in real-time to your coding, AI tools, builds, and tests.
                </p>
                <div className="preview-box" style={{ marginBottom: '24px' }}>
                  <PetPreviewCanvas
                    species={config.pet.species}
                    skin={config.appearance.skin}
                    accessory={config.appearance.accessory}
                    scale={5}
                  />
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setOnboardingStep(2)}>
                  Next: Select Coding Tools →
                </button>
              </div>
            )}

            {onboardingStep === 2 && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Select your coding tools</h2>
                <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>
                  Choose which tools and AI assistants you use. CodePet will listen for activity from them.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', maxHeight: '280px', overflowY: 'auto', marginBottom: '20px' }}>
                  {TOOL_REGISTRY.slice(0, 8).map(tool => {
                    const isSelected = config.tools.enabledTools.includes(tool.id);
                    return (
                      <div
                        key={tool.id}
                        className={`tool-select-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          const updated = isSelected
                            ? config.tools.enabledTools.filter(id => id !== tool.id)
                            : [...config.tools.enabledTools, tool.id];
                          setConfig({ ...config, tools: { ...config.tools, enabledTools: updated } });
                        }}
                      >
                        <span style={{ fontSize: '13px', fontWeight: 500 }}>{tool.name}</span>
                        <span>{isSelected ? '✓' : '+'}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-secondary" onClick={() => setOnboardingStep(1)}>Back</button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setOnboardingStep(3)}>Next: Choose Pet →</button>
                </div>
              </div>
            )}

            {onboardingStep === 3 && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Choose your pet</h2>
                <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>
                  Select the character that will accompany your developer journey.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', maxHeight: '280px', overflowY: 'auto', marginBottom: '20px', paddingRight: '4px' }}>
                  {PET_SPECIES_META.map(meta => (
                    <div
                      key={meta.id}
                      className={`tool-select-card ${config.pet.species === meta.id ? 'selected' : ''}`}
                      onClick={() => setConfig({ ...config, pet: { ...config.pet, species: meta.id as any } })}
                      style={{ flexDirection: 'column', padding: '12px 6px', textAlign: 'center' }}
                    >
                      <PetPreviewCanvas species={meta.id as any} skin="default" accessory="none" scale={2} />
                      <span style={{ fontSize: '11px', fontWeight: 600, marginTop: '6px' }}>{meta.name}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-secondary" onClick={() => setOnboardingStep(2)}>Back</button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setOnboardingStep(4)}>Next: Basic Settings →</button>
                </div>
              </div>
            )}

            {onboardingStep === 4 && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Final Touches</h2>
                <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>
                  Customize size and sounds, then launch your pet onto your desktop!
                </p>
                <div className="form-group">
                  <label className="form-label">Pet Size</label>
                  <select
                    className="select-custom"
                    value={config.appearance.pixelScale}
                    onChange={(e) => setConfig({ ...config, appearance: { ...config.appearance, pixelScale: parseInt(e.target.value) } })}
                  >
                    <option value={3}>Compact (3x scale)</option>
                    <option value={4}>Standard (4x scale)</option>
                    <option value={5}>Large (5x scale)</option>
                  </select>
                </div>
                <div className="toggle-row" style={{ marginBottom: '24px' }}>
                  <div>
                    <div className="toggle-label">Play 8-Bit Sound Effects</div>
                    <div className="toggle-sub">Subtle retro chiptune bleeps on builds & tests</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={config.sound.enabled}
                      onChange={(e) => setConfig({ ...config, sound: { ...config.sound, enabled: e.target.checked } })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-secondary" onClick={() => setOnboardingStep(3)}>Back</button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={finishOnboarding}>
                    Launch CodePet onto Desktop 🚀
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Custom Tool Modal */}
      {showAddTool && (
        <div className="onboarding-overlay">
          <div className="onboarding-card" style={{ maxWidth: '480px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Add Custom Coding Tool</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
              Configure any CLI agent, custom compiler, or local script to trigger pet reactions.
            </p>
            <div className="form-group">
              <label className="form-label">Tool Name</label>
              <input
                type="text"
                className="input-text"
                placeholder="e.g. My Custom Agent"
                value={newToolName}
                onChange={(e) => setNewToolName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Detection Process or Command</label>
              <input
                type="text"
                className="input-text"
                placeholder="e.g. my-agent-cli"
                value={newToolCommand}
                onChange={(e) => setNewToolCommand(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setShowAddTool(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAddCustomTool}>Save Tool</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
