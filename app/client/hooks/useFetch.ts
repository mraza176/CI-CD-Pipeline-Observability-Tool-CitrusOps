import instance from "@/axios";
import { useState } from "react";

type DataType = {
  argocdURL: string;
  available_pipeline: string[];
  email: string;
  password: string;
  message: string;
  deviationValue: number;
  customMessage: string;
  status: string;
};

const useFetch = (url: string, optionalHeaderValue = true) => {
  const [data, setData] = useState<DataType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const authToken = optionalHeaderValue
        ? JSON.parse(localStorage.getItem("userData") as string).token
        : {};
      const headers = {
        Authorization: `Bearer ${authToken}`,
      };
      const response = await instance.get(url, { headers });
      if (response.status === 200) setData(response.data);
      else setError("Failed. Please try again!");
      console.log(response);
    } catch (error: any) {
      console.log(error);
      if (error?.response?.status === 401) {
        setError(error.response.data.Error || error.response.statusText);
      } else setError("We are facing some issue. Try Again!");
    } finally {
      setLoading(false);
    }
  };

  return { data, error, loading, fetchData };
};

export default useFetch;
