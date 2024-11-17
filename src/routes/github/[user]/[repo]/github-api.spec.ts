import { describe, it, vi, Mock, beforeEach } from "vitest";
import { delay, Fetch, GithubApi } from "./github-api";

describe("github-api", () => {
  let fetchMock: Mock<Parameters<Fetch>, ReturnType<Fetch>>;
  let delayMock: Mock<[number], Promise<void>>;
  let api: GithubApi;

  beforeEach(() => {
    fetchMock = vi.fn<Parameters<Fetch>, ReturnType<Fetch>>(mockPromise);
    delayMock = vi.fn<[number], Promise<void>>(mockPromise);
    api = new GithubApi("TOKEN", fetchMock, delayMock);
  });

  describe("getRepository", () => {
    // se puede importar el expect de vitest
    // pero al usarlo asi, estas vinculando el scope del expect
    // a este test solo
    it("should return repository information", async ({ expect }) => {
      const responsePromise = api.getRepository("USERNAME", "REPOSITORY");
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.github.com/repos/USERNAME/REPOSITORY",
        {
          headers: {
            "User-Agent": "Qwik Workshop",
            "X-GitHub-Api-Version": "2022-11-28",
            Authorization: "Bearer TOKEN",
          },
        }
      );

      fetchMock.mock.results[0].value.resolve(new Response('"RESPONSE"'));
      expect(await responsePromise).toEqual("RESPONSE");

      // claramente este test no es bueno, ya que si github se cae,
      // o manejamos muchos repos, tenemos un montón de texto para traer
      // y sacar el snapshot
      // expect(response).toMatchSnapshot();
    });

    it("should timeout after x seconds with time out responses", async ({
      expect,
    }) => {
      const responsePromise = api.getRepository("USERNAME", "REPOSITORY");

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.github.com/repos/USERNAME/REPOSITORY",
        {
          headers: {
            "User-Agent": "Qwik Workshop",
            "X-GitHub-Api-Version": "2022-11-28",
            Authorization: "Bearer TOKEN",
          },
        }
      );

      expect(delayMock).toHaveBeenCalledWith(4000);
      // en este caso no me interesa resolver la promesa
      delayMock.mock.results[0].value.resolve();
      expect(await responsePromise).toEqual({ response: "timeout" });
    });
  });

  describe("getRepositories", () => {
    it("should fetch all repositories for a user", async ({ expect }) => {
      const responsePromise = api.getRepositories("USERNAME");

      const perPage = 30;
      expect(fetchMock).toHaveBeenCalledWith(
        `https://api.github.com/users/USERNAME/repos?per_page=30&page=1`,
        expect.any(Object) // headers, no me importa el contenido
      );

      const repoSet1 = new Array(perPage).fill(null).map((_, i) => ({ id: i }));

      fetchMock.mock.results[0].value.resolve(
        new Response(JSON.stringify(repoSet1))
      );

      await delay(0); // sin esto no funciona

      expect(fetchMock).toHaveBeenCalledWith(
        `https://api.github.com/users/USERNAME/repos?per_page=30&page=1`,
        expect.any(Object) // headers, no me importa el contenido
      );

      const repoSet2 = [{ id: 31 }];

      fetchMock.mock.results[1].value.resolve(
        new Response(JSON.stringify(repoSet2))
      );

      expect(await responsePromise).toEqual([...repoSet1, ...repoSet2]);
    });
  });
});

function mockPromise<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: any) => void;

  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  }) as Promise<T> & { resolve: typeof resolve; reject: typeof reject };

  promise.resolve = resolve;
  promise.reject = reject;

  return promise;
}
