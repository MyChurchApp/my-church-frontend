import LoginPageContainer from "@/containers/login/Login";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContainer />
    </Suspense>
  );
}
