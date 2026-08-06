"use client";

import React, {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import confetti from "canvas-confetti";
import type {
  GlobalOptions as ConfettiGlobalOptions,
  Options as ConfettiOptions,
} from "canvas-confetti";

type Api = {
  fire: (options?: ConfettiOptions) => void;
};

type ConfettiContextType = Api | null;

const ConfettiContext = createContext<ConfettiContextType>(null);

export interface ConfettiProps extends React.ComponentPropsWithRef<"canvas"> {
  options?: ConfettiGlobalOptions;
  globalOptions?: ConfettiGlobalOptions;
  manualstart?: boolean;
}

export type ConfettiRef = Api;

const Confetti = forwardRef<ConfettiRef, ConfettiProps>((props, ref) => {
  const {
    options,
    globalOptions,
    manualstart = false,
    className,
    ...rest
  } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiInstanceRef = useRef<confetti.CreateTypes | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      confettiInstanceRef.current = confetti.create(canvasRef.current, {
        ...globalOptions,
        resize: true,
      });
    }
    return () => {
      confettiInstanceRef.current = null;
    };
  }, [globalOptions]);

  const fire = (fireOptions?: ConfettiOptions) => {
    if (confettiInstanceRef.current) {
      confettiInstanceRef.current({
        ...options,
        ...fireOptions,
      });
    } else {
      confetti({
        ...options,
        ...fireOptions,
      });
    }
  };

  useImperativeHandle(ref, () => ({
    fire,
  }));

  useEffect(() => {
    if (!manualstart) {
      fire();
    }
  }, [manualstart]);

  return (
    <ConfettiContext.Provider value={{ fire }}>
      <canvas ref={canvasRef} className={className} {...rest} />
    </ConfettiContext.Provider>
  );
});

Confetti.displayName = "Confetti";

export interface ConfettiButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  options?: ConfettiOptions;
}

export function ConfettiButton({
  options,
  children,
  onClick,
  ...props
}: ConfettiButtonProps) {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    try {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        ...options,
        origin: { x, y },
      });
    } catch (e) {
      console.warn('Confetti animation warning:', e);
    }

    if (onClick) {
      onClick(event);
    }
  };

  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

export { Confetti };
