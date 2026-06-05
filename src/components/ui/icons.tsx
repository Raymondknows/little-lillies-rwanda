import type { ComponentPropsWithoutRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp, faWhatsappSquare } from "@fortawesome/free-brands-svg-icons";

type IconProps = Omit<ComponentPropsWithoutRef<typeof FontAwesomeIcon>, "icon">;

export function WhatsAppIcon(props: IconProps) {
  return <FontAwesomeIcon icon={faWhatsapp} {...props} />;
}

export function WhatsAppSquareIcon(props: IconProps) {
  return <FontAwesomeIcon icon={faWhatsappSquare} {...props} />;
}
