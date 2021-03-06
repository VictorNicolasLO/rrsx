import React, { useEffect } from 'react';
import { component, injectService } from '../service-manager';
import LayoutService from '../service-manager/layout-service';
import { Redirect } from 'react-router-dom';
import navigator from './navigator';
function runOnEnter(onEnter) {
  if (onEnter) {
    if (onEnter.length) for (let i in onEnter) onEnter[i]();
    else onEnter();
  }
}

function runOnOut(onOut) {
  if (onOut) {
    if (onOut.length) for (let i in onOut) onOut[i]();
    else onOut();
  }
}

function runProtect(protect) {
  if (protect) {
    if (protect.length)
      for (let i in protect) {
        const protectRes = protect[i]();
        if (protectRes) {
          return protectRes;
        }
      }
    else {
      const protectRes = protect();
      if (protectRes) {
        return protectRes;
      }
    }
  }
}

function runDisableLayout(services) {
  for (let i in services) services[i].disable();
}

function runEnableLayout(services) {
  for (let i in services) {
    services[i].enable();
  }
}

export function createRouteComponent(opt) {
  const Component = opt.component;
  let services = [];
  if (opt.disableLayout)
    services = !opt.disableLayout.length
      ? [injectService(opt.disableLayout)]
      : opt.disableLayout.map((item) => {
          return injectService(item);
        });

  let isDisableLayouRun = false;

  const routedComponent = (props) => {
    navigator.setRoute(props.location, props.match, props.history);
    useEffect(() => {
      runOnEnter(opt.onEnter);
      return () => {
        runEnableLayout(services);
        runOnOut(opt.onOut);
      };
    }, []);
    if (!isDisableLayouRun) {
      runDisableLayout(services);
      isDisableLayouRun = true;
    }
    if (opt.wait) {
      const isLoading = opt.wait.for();
      return;
    }
    const isProtected = runProtect(opt.guard);
    if (isProtected) {
      return <Redirect to={isProtected} />;
    }

    return (
      <Component
        location={props.location}
        match={props.match}
        history={props.history}
      />
    );
  };

  return React.memo(
    component(routedComponent),
    (prev, next) => prev.location.pathname == next.location.pathname,
  );
}
