"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";

export default function PageTransition({ children }) {
  const pathname = usePathname();
  const [key, setKey] = useState(pathname);
  const nodeRef = useRef(null);

  useEffect(() => {
    setKey(pathname);
  }, [pathname]);

  return (
    <div className="transition-wrapper">
      <SwitchTransition mode="out-in">
        <CSSTransition
          key={key}
          nodeRef={nodeRef}
          timeout={300}
          classNames="fade"
          unmountOnExit
          appear
        >
          <div ref={nodeRef} className="page-transition">
            {children}
          </div>
        </CSSTransition>
      </SwitchTransition>
    </div>
  );
}