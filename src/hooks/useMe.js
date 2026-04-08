import { useState, useEffect, useCallback } from "react";
import API from "../APi/axiosConfig";
import { ENDPOINTS } from "../APi/endpoints";

export function useMe() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMe(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    try {
      const { data } = await API.get(ENDPOINTS.ME);
      setMe(data);
      setError(null);
      if (data.name) {
        localStorage.setItem("userName", data.name);
      }
    } catch (e) {
      setError(e);
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { me, loading, error, refetch };
}
