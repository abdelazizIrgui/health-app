import React, { useEffect, useState } from 'react';

import BottomSheet from './BottomSheet';
import PinPad from './PinPad';
import { useLock } from '../context/LockContext';
import { useI18n } from '../i18n/I18nContext';

export type PinMode = 'create' | 'change' | 'disable';
type Step = 'current' | 'new' | 'confirm';

interface Props {
  visible: boolean;
  mode: PinMode;
  onClose: () => void;
}

/** Bottom sheet to create a PIN, change it, or turn the lock off. */
export default function PinSheet({ visible, mode, onClose }: Props) {
  const { t } = useI18n();
  const { setPin, verifyPin, disable, secondsLeft } = useLock();

  const firstStep: Step = mode === 'create' ? 'new' : 'current';
  const [step, setStep] = useState<Step>(firstStep);
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Start from the beginning every time the sheet opens.
  useEffect(() => {
    if (visible) {
      setStep(firstStep);
      setFirstPin('');
      setError(null);
    }
  }, [visible, firstStep]);

  const onComplete = async (pin: string) => {
    if (step === 'current') {
      if (!(await verifyPin(pin))) {
        setError(t('lock.wrong'));
        return;
      }
      if (mode === 'disable') {
        await disable();
        onClose();
        return;
      }
      setError(null);
      setStep('new');
    } else if (step === 'new') {
      setFirstPin(pin);
      setError(null);
      setStep('confirm');
    } else {
      if (pin !== firstPin) {
        setError(t('lock.mismatch'));
        setStep('new');
        return;
      }
      await setPin(pin);
      onClose();
    }
  };

  const title =
    step === 'current'
      ? t(mode === 'disable' ? 'lock.disableTitle' : 'lock.currentTitle')
      : step === 'new'
        ? t('lock.createTitle')
        : t('lock.confirmTitle');

  const waiting = step === 'current' && secondsLeft > 0;

  return (
    <BottomSheet visible={visible} title={title} onClose={onClose}>
      <PinPad
        onComplete={onComplete}
        subtitle={step === 'new' ? t('lock.createHint') : undefined}
        error={waiting ? t('lock.tooMany', { sec: secondsLeft }) : error}
        disabled={waiting}
      />
    </BottomSheet>
  );
}