import { useEffect, useState } from "react";
import { IProductCart } from "../../api/dto/IProductInfo";
import { ITicket } from "../../api/dto/ITickets";
import { shopRepository } from "../../api/shopRepository";
import { ticketsRepository } from "../../api/ticketsRepository";
import { getCookie } from "../../assets/constants/getCookie";
import { setFavouritsCookie } from "../../assets/helpers/setFavouritsCookie";

type ShopStateType = {
  drawerIsOpen?: boolean;
  favourites?: string[];
  tickets?: ITicket[];
  products?: IProductCart;
  card?: string | null;
};

type Props = {
  value?: ShopStateType;
};

const getIds = (res: { id: string }[]) => res.map(({ id }) => id);

export const useShop = ({ value }: Props) => {
  const [shop, setShopState] = useState<ShopStateType | undefined>(value);

  const setFavourites = (favourites?: string[]) => setShopState((state) => ({ ...state, favourites }));

  const setDrawerIsOpen = (drawerIsOpen?: boolean) => setShopState((store) => ({ ...store, drawerIsOpen }));

  const setListShop = (products: IProductCart) => setShopState((state) => ({ ...state, products }));

  const setListTicket = (tickets: ITicket[]) => setShopState((state) => ({ ...state, tickets }));

  const setCardTicket = (card?: string | null) => setShopState((state) => ({ ...state, card }));

  const updateFavourites = (id: string) => {
    const stateHasFavorite = shop?.favourites?.some((Id: string) => Id === id);
    const favourits = stateHasFavorite
      ? shop?.favourites?.filter((Id: string) => Id !== id)
      : [...(shop?.favourites || []), id];

    if (getCookie("access_token")) shopRepository[stateHasFavorite ? "deleteFavourite" : "addFavourite"]([id]);
    else setFavouritsCookie(favourits);

    setFavourites(favourits);
  };

  const updateShopData = () => {
    if ((localStorage.getItem("backUrl") || "/").startsWith("http")) return;

    shopRepository.fetchShopBasket().then(setListShop);
    ticketsRepository.fetchCartTickets().then((res) => {
      setListTicket(res.list);
      setCardTicket(res.card);
    });

    if (getCookie("access_token")) shopRepository.fetchFavourites().then((res) => setFavourites(getIds(res)));
    else setFavourites(JSON.parse(getCookie("favourites") || "[]"));
  };

  useEffect(() => {
    updateShopData();
  }, []);

  return {
    shop,
    setFavourites,
    updateFavourites,
    updateShopData,
    setListShop,
    setListTicket,
    setDrawerIsOpen,
    setCardTicket,
  };
};
