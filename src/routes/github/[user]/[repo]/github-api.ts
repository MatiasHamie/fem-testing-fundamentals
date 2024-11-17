import type { paths } from "@octokit/openapi-types";

type OrgRepoResponse =
  paths["/repos/{owner}/{repo}"]["get"]["responses"]["200"]["content"]["application/json"];

// Cada vez que tenemos un fetch o algo que usa una dependencia externa
// como en este caso, usamos fetch para llamar a la API de github
// si lo queremos mockear, debemos tener una forma de poder reemplazarlo
// es por esto, que agregamos como una variable de la clase el fetchMock
export type Fetch = typeof fetch;

export class GithubApi {
  constructor(
    private token: string | undefined,
    private fetch: Fetch = fetch,
    private delay: (ms: number) => Promise<void> = delay
  ) {}

  async getRepositories(username: string) {
    let page = 1;
    const perPage = 30;
    const repositories: OrgRepoResponse[] = [];

    while (true) {
      const response = await this.fetch(
        `https://api.github.com/users/${username}/repos?per_page=30&page=${page}`,
        {
          headers: {
            "User-Agent": "Qwik Workshop",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );
      const json = (await response.json()) as OrgRepoResponse[];
      repositories.push(...json);

      if (json.length < perPage) {
        break;
      }
      page++;
    }
    return repositories;
  }

  async getRepository(user: string, repo: string) {
    const headers: HeadersInit = {
      "User-Agent": "Qwik Workshop",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (this.token) {
      headers["Authorization"] = "Bearer " + this.token;
    }

    return Promise.race([
      this.delay(4000).then(() => {
        return { response: "timeout" };
      }),
      this.fetch(`https://api.github.com/repos/${user}/${repo}`, {
        headers,
      }).then((response) => {
        return response.json();
      }),
    ]);
    // const response = await this.fetch(
    //   `https://api.github.com/repos/${user}/${repo}`,
    //   {
    //     headers,
    //   }
    // );
    // const repository = (await response.json()) as OrgRepoResponse;
    // return repository;
  }
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
