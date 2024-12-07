
import { create } from 'zustand'

interface Deployment {

    deploymentConfig : string;
    configUrl : string;

    setDeploymentConfig : (v : string) => void;
    setConfigUrl : (v : string) => void;

}

export const useDeploymentStore = create<Deployment>()(
    (set) => ({

        deploymentConfig: "",
        configUrl: "",

        setDeploymentConfig: (v) => set(() => ({
	    deploymentConfig: v
	})),

        setConfigUrl: (v) => set(() => ({
	    configUrl: v
	})),

    })
);

