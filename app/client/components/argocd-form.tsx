"use client";

import useFetch from "@/hooks/useFetch";
import usePost from "@/hooks/usePost";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

function ArgocdForm() {
  const [argocdURL, setArgocdURL] = useState("");
  const [argocdToken, setArgocdToken] = useState("");

  const { data, fetchData } = useFetch("/api/argocdurl");
  const { error, postData } = usePost();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (data) {
      setArgocdURL(data.argocdURL);
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!argocdToken || !argocdURL) {
        toast.error("Please provide both ArgoCD URL and Token.");
        return;
      }
      await postData("/api/argocdurl", { argocdURL });
      await postData("/api/token", { token: argocdToken });
      if (error) {
        toast.error(error);
        return;
      }
      toast.success("URL and Token Updated Successfully!");
      setArgocdToken("");
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Error updating URL!");
      }
    }
  };

  return (
    <form className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 items-center">
        <h1 className="text-2xl font-bold">ArgoCD Integration</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your argocd url and token below to integrate.
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="argocdurl">Url</Label>
          <Input
            id="argocdurl"
            name="argocdurl"
            placeholder="http://127.0.0.1:8081/api/v1/applications"
            required
            value={argocdURL}
            onChange={(e) => setArgocdURL(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="argocdtoken">Token</Label>
          <Input
            id="argocdtoken"
            name="argocdtoken"
            type="password"
            placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
            required
            value={argocdToken}
            onChange={(e) => setArgocdToken(e.target.value)}
          />
        </div>
        <SubmitButton onSubmit={handleSubmit} />
      </div>
    </form>
  );
}

export default ArgocdForm;

function SubmitButton({ onSubmit }: any) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="w-full"
      disabled={pending}
      onClick={onSubmit}
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin" />
          Saving...
        </>
      ) : (
        "Save"
      )}
    </Button>
  );
}
