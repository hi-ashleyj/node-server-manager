export type WorkZones = "script" | "git" | "install" | "build";

type WorksNone = {
    zone: "none";
}

type WorksSpinner = {
    zone: WorkZones;
    spinner: true;
}

type WorksSuccess = {
    zone: WorkZones;
    success: true;
}

type WorksError = {
    zone: WorkZones;
    error: string;
}

export type Works = WorksNone | WorksSpinner | WorksSuccess | WorksError;