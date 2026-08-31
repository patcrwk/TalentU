import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Fail closed: if Supabase is unreachable, treat the visitor as signed out
  // rather than letting protected routes render with no data behind them.
  let user = null;
  try {
    const {
      data: { user: fetchedUser },
    } = await supabase.auth.getUser();
    user = fetchedUser;
  } catch {
    user = null;
  }

  const path = request.nextUrl.pathname;
  // The whole app is an internal staff tool with no public signup, so every
  // route requires a signed-in account except the login page itself.
  const isPublic = path === "/login";

  if (!user && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  if (user && path.startsWith("/admin")) {
    const { data: appUser } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (appUser?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (user && path === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}
