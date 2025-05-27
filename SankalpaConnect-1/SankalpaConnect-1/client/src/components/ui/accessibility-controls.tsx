import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Volume2, Eye, Type, Contrast } from 'lucide-react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface AccessibilityControlsProps {
  className?: string;
}

export function AccessibilityControls({ className = '' }: AccessibilityControlsProps) {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const { speak, stop, isSupported: ttsSupported, readPageContent } = useTextToSpeech();

  // Load accessibility preferences from localStorage
  useEffect(() => {
    const savedPrefs = localStorage.getItem('accessibility-preferences');
    if (savedPrefs) {
      try {
        const prefs = JSON.parse(savedPrefs);
        setVoiceEnabled(prefs.voiceEnabled || false);
        setHighContrast(prefs.highContrast || false);
        setLargeText(prefs.largeText || false);
        setReducedMotion(prefs.reducedMotion || false);
      } catch (error) {
        console.error('Failed to load accessibility preferences:', error);
      }
    }
  }, []);

  // Save preferences whenever they change
  useEffect(() => {
    const prefs = { voiceEnabled, highContrast, largeText, reducedMotion };
    localStorage.setItem('accessibility-preferences', JSON.stringify(prefs));
  }, [voiceEnabled, highContrast, largeText, reducedMotion]);

  // Apply accessibility settings to the document
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast
    if (highContrast) {
      root.classList.add('accessibility-high-contrast');
    } else {
      root.classList.remove('accessibility-high-contrast');
    }
    
    // Large text
    if (largeText) {
      root.classList.add('accessibility-large-text');
    } else {
      root.classList.remove('accessibility-large-text');
    }
    
    // Reduced motion
    if (reducedMotion) {
      root.classList.add('accessibility-reduced-motion');
    } else {
      root.classList.remove('accessibility-reduced-motion');
    }
  }, [highContrast, largeText, reducedMotion]);

  const handleVoiceToggle = (enabled: boolean) => {
    if (!enabled) {
      // Stop any current speech immediately when disabling
      stop();
    }
    setVoiceEnabled(enabled);
    if (enabled) {
      speak('Voice assistance enabled. All buttons and content will be read aloud when interacted with.');
    }
  };

  const handleHighContrastToggle = (enabled: boolean) => {
    setHighContrast(enabled);
    if (voiceEnabled) {
      speak(enabled ? 'High contrast mode enabled' : 'High contrast mode disabled');
    }
  };

  const handleLargeTextToggle = (enabled: boolean) => {
    setLargeText(enabled);
    if (voiceEnabled) {
      speak(enabled ? 'Large text mode enabled' : 'Large text mode disabled');
    }
  };

  const handleReducedMotionToggle = (enabled: boolean) => {
    setReducedMotion(enabled);
    if (voiceEnabled) {
      speak(enabled ? 'Reduced motion enabled' : 'Reduced motion disabled');
    }
  };

  const handleReadAloud = () => {
    if (voiceEnabled) {
      readPageContent();
    } else {
      speak('Voice assistance is disabled. Please enable it first to use read aloud feature.');
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <Eye className="w-5 h-5 mr-2" />
          Accessibility Features
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Assistance */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-gray-600" />
            <Label htmlFor="voice-assist" className="text-sm text-gray-700">
              Voice Assistance
            </Label>
          </div>
          <Switch
            id="voice-assist"
            checked={voiceEnabled}
            onCheckedChange={handleVoiceToggle}
            disabled={!ttsSupported}
            aria-label="Toggle voice assistance"
          />
        </div>

        {!ttsSupported && (
          <p className="text-xs text-gray-500">
            Voice assistance is not supported in this browser.
          </p>
        )}

        {/* High Contrast */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Contrast className="w-4 h-4 text-gray-600" />
            <Label htmlFor="high-contrast" className="text-sm text-gray-700">
              High Contrast
            </Label>
          </div>
          <Switch
            id="high-contrast"
            checked={highContrast}
            onCheckedChange={handleHighContrastToggle}
            aria-label="Toggle high contrast mode"
          />
        </div>

        {/* Large Text */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Type className="w-4 h-4 text-gray-600" />
            <Label htmlFor="large-text" className="text-sm text-gray-700">
              Large Text
            </Label>
          </div>
          <Switch
            id="large-text"
            checked={largeText}
            onCheckedChange={handleLargeTextToggle}
            aria-label="Toggle large text mode"
          />
        </div>

        {/* Reduced Motion */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-4 h-4 text-gray-600 text-sm">🌊</span>
            <Label htmlFor="reduced-motion" className="text-sm text-gray-700">
              Reduced Motion
            </Label>
          </div>
          <Switch
            id="reduced-motion"
            checked={reducedMotion}
            onCheckedChange={handleReducedMotionToggle}
            aria-label="Toggle reduced motion"
          />
        </div>

        {/* Read Aloud Button */}
        <Button
          onClick={handleReadAloud}
          className="w-full bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200"
          variant="outline"
          disabled={!ttsSupported}
          aria-label="Read page content aloud"
        >
          <Volume2 className="w-4 h-4 mr-2" />
          Read Aloud
        </Button>
      </CardContent>
    </Card>
  );
}
