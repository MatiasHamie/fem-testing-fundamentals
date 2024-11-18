import { describe, it } from "vitest";
import { cluster, loadDataset } from "./clustering";

describe("Clustering", () => {
  it("should load data", ({ expect }) => {
    const dataset = loadDataset();

    expect(dataset).toMatchSnapshot();
  });

  it("should create a cluster", ({ expect }) => {
    const dataset = [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 1 },
      { lat: 10, lng: 10 },
      { lat: 11, lng: 11 },
    ];
    const clusters = cluster(dataset, 5, 1);

    // no tiene sentido hacer un snapshot global, ya que los valores de lat y lng son aleatorios y no se sabe si esta bien o no
    // se aconseja hacer unos mocks chicos, un snapshot de esos mocks y luego hacer un expect de los mocks
    // te interesa que funcione nomas

    expect(clusters).toMatchObject({
      clusters: [
        {
          data: [
            {
              lat: 0,
              lng: 0,
            },
            {
              lat: 0,
              lng: 1,
            },
          ],
          latMax: 0,
          latMin: 0,
          lngMax: 1,
          lngMin: 0,
        },
        {
          data: [
            {
              lat: 10,
              lng: 10,
            },
            {
              lat: 11,
              lng: 11,
            },
          ],
          latMax: 11,
          latMin: 10,
          lngMax: 11,
          lngMin: 10,
        },
      ],
      latMax: 11,
      latMin: 0,
      lngMax: 11,
      lngMin: 0,
    });
  });
});
