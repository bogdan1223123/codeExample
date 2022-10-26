import { useEffect, useState } from "react";
import { BannersResponce } from "../../api/dto/Banner";
import { IPartner } from "../../api/dto/IPartner";
import { IProductCategory } from "../../api/dto/IProduct";
import { ITeam } from "../../api/dto/ITeam";
import { IMetaTags } from "../../components/baseMeta/baseMeta";

export type InitialDataType = {
  partners: IPartner[];
  teams: ITeam[];
  shopCategories: {
    ru: IProductCategory[];
    en: IProductCategory[];
  };
  banners: BannersResponce;
  metaTags: IMetaTags;
};

type Props = {
  value?: InitialDataType;
};

export const useInitialData = ({ value }: Props) => {
  const [data, changeData] = useState<InitialDataType | undefined>(value);
  const setData = (data?: InitialDataType) => changeData(data);

  useEffect(() => {
    value && setData({ ...data, ...value });
  }, [value]);

  return { data, setData };
};
