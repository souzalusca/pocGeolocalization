import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useServices } from "@/app/ServicesContext";
import type {
  GeoPosition,
  GeoRequestOptions,
} from "@/domain/models/GeoPosition";
import { GeolocationError } from "@/domain/models/GeolocationError";
import {
  toDetailItems,
  toGoogleMapsUrl,
  type DetailItem,
} from "./geolocationFormatters";
import {
  geolocationReducer,
  initialGeolocationState,
  lastKnownPosition,
} from "./geolocationState";

export interface GeolocationViewModel {
  /** Última posição conhecida (mantida durante novas buscas e em caso de erro). */
  readonly position: GeoPosition | null;
  readonly details: readonly DetailItem[];
  readonly mapsUrl: string | null;
  readonly isLoading: boolean;
  readonly errorMessage: string | null;
  readonly buttonLabel: string;
  readonly requestLocation: () => void;
  readonly reset: () => void;
}

/**
 * ViewModel da tela de geolocalização.
 * Concentra estado, regras de apresentação e comandos. A View apenas
 * renderiza o que é exposto aqui e dispara os comandos.
 */
export function useGeolocationViewModel(
  options?: GeoRequestOptions,
): GeolocationViewModel {
  const { geolocationService } = useServices();
  const [state, dispatch] = useReducer(
    geolocationReducer,
    initialGeolocationState,
  );

  // Evita race conditions (cliques repetidos) e setState após desmontar.
  const requestIdRef = useRef(0);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(
    () => () => {
      requestIdRef.current += 1;
    },
    [],
  );

  const requestLocation = useCallback(() => {
    const requestId = ++requestIdRef.current;
    dispatch({ type: "REQUEST" });

    geolocationService
      .getCurrentPosition(optionsRef.current)
      .then((position) => {
        console.log("position", position);
        if (requestId === requestIdRef.current)
          dispatch({ type: "RESOLVE", position });
      })
      .catch((error: unknown) => {
        if (requestId === requestIdRef.current) {
          dispatch({ type: "REJECT", error: GeolocationError.from(error) });
        }
      });
  }, [geolocationService]);

  const reset = useCallback(() => {
    requestIdRef.current += 1;
    dispatch({ type: "RESET" });
  }, []);

  const position = lastKnownPosition(state);
  const isLoading = state.status === "loading";

  const details = useMemo(
    () => (position ? toDetailItems(position) : []),
    [position],
  );
  const mapsUrl = useMemo(
    () => (position ? toGoogleMapsUrl(position) : null),
    [position],
  );

  return {
    position,
    details,
    mapsUrl,
    isLoading,
    errorMessage: state.status === "error" ? state.error.message : null,
    buttonLabel: isLoading
      ? "Buscando localização…"
      : position
        ? "Atualizar localização"
        : "Obter minha localização",
    requestLocation,
    reset,
  };
}
