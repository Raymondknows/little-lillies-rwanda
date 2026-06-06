import countriesJson from "../../../../../config/countries.json";
import { NextResponse } from "next/server";
import {
  getCountryFromCookieHeader,
  getCountryFromRequest,
  makeCountryCookie,
  SUPPORTED_COUNTRIES,
} from "@/lib/country";

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const detectedCookieCountry = await getCountryFromCookieHeader(cookieHeader);
    const detectedCountry = await getCountryFromRequest(req);
    const defaultCountry = (countriesJson as any).default;
    const country = detectedCountry || defaultCountry;
    const countries: any = (countriesJson as any).countries;
    const data = countries[country] || countries[defaultCountry];
    const cookiePresent = Boolean(detectedCookieCountry);
    const response = NextResponse.json({ country, data, cookiePresent });

    if (!cookiePresent && detectedCountry && SUPPORTED_COUNTRIES.includes(detectedCountry)) {
      const cookie = await makeCountryCookie(detectedCountry);
      response.headers.set("Set-Cookie", cookie);
    }

    return response;
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
