import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { IUser } from "../../api/dto/IProfileMock";
import { userRepository } from "../../api/userRepository";
import { getCookie } from "../../assets/constants/getCookie";
import { setUserCookie } from "../../assets/helpers/setUserCoockie";
import { refreshToken } from "../refreshToken";

type AuthStateType = {
  user?: IUser;
  receiveMsgModalIsOpen?: boolean;
};

type Props = {
  value?: AuthStateType;
};

export const useAuth = ({ value }: Props) => {
  const { query, push } = useRouter();
  const [auth, setAuthState] = useState<AuthStateType | undefined>(value);

  const setUser = (user?: IUser) => setAuthState((state) => ({ ...state, user }));

  const fetchUserData = async () => {
    if (getCookie("access_token")) {
      const user = await userRepository.fetchUserInfo();
      setUser(user);
      return user;
    }
  };

  const setReceiveMsgModalIsOpen = (receiveMsgModalIsOpen?: boolean) =>
    setAuthState((state) => ({ ...state, receiveMsgModalIsOpen }));

  const goBack = async () => {
    const backUrl = localStorage.getItem("backUrl") || "/";
    const backToProfile = backUrl.includes("/profile/");

    if (backUrl.startsWith("http")) window.location.assign(backUrl);
    else {
      const user = await fetchUserData();
      user?.AllowToUseWinline === null && setReceiveMsgModalIsOpen(true);
      backToProfile && !user ? push("/") : push(backUrl);
    }
  };

  useEffect(() => {
    if (query?.access_token) {
      setUserCookie({ access_token: String(query?.access_token), expires_in: 3600 });
      fetchUserData();
      return;
    }

    const refreshAuth = async () => {
      const refresh_token = getCookie("refresh_token");
      let expires_in = getCookie("expires_in");
      let timeout = expires_in ? +new Date(expires_in) - Date.now() : 0;
      const status = refresh_token && timeout < 6000000 && (await refreshToken());
      if (status === "success") await fetchUserData();

      expires_in = getCookie("expires_in");
      if (!expires_in) return;
      timeout = +new Date(expires_in) - Date.now();
      setTimeout(() => refreshAuth(), timeout);
    };

    refreshAuth();
  }, []);

  return { auth, setUser, goBack, setReceiveMsgModalIsOpen };
};
