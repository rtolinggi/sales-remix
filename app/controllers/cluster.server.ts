import { prisma } from "../utils/prisma.server";
import { json } from "@remix-run/node";

type PropsSubCluster = {
  id?: number;
  clusterId: number;
  subClusterName: string;
};

export const deleteSubCluster = async (id: string) => {
  try {
    const result = await prisma.sub_clusters.delete({
      where: {
        id: parseInt(id),
      },
    });
    if (!result) return false;
    return result;
  } catch (error) {
    console.log(error);
    return json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const createSubCluster = async (data: PropsSubCluster) => {
  try {
    const result = await prisma.sub_clusters.create({
      data,
    });
    if (!result) return false;
    return result;
  } catch (error) {
    console.log(error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};

export const updateSubCluster = async (data: PropsSubCluster) => {
  try {
    const result = await prisma.sub_clusters.create({
      data,
    });
    if (!result) return false;
    return result;
  } catch (error) {
    console.log(error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};

export const createCluster = async (name: string) => {
  try {
    const insertCluster = await prisma.clusters.create({
      data: {
        clusterName: name,
      },
    });
    if (insertCluster) return true;
    return false;
  } catch (error) {
    console.log(error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};

export const updateCluster = async (id: string, name: string) => {
  try {
    const result = await prisma.clusters.update({
      where: {
        clusterId: parseInt(String(id)),
      },
      data: {
        clusterName: name,
      },
    });
    if (!result) return json({ success: false }, { status: 400 });
    return result;
  } catch (error) {
    console.log(error);
    return json(
      { success: false, error: "Internal Server Error" },
      { status: 200 }
    );
  }
};

export const getSubCluster = async () => {
  try {
    const subCluster = await prisma.sub_clusters.findMany({
      select: {
        clusterId: true,
        id: true,
        subClusterName: true,
        clusters: {
          select: {
            clusterName: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });
    if (!subCluster) return false;
    return subCluster;
  } catch (error) {
    console.log(error);
    return json({ success: false, errors: error }, { status: 500 });
  }
};

export const getCluster = async () => {
  try {
    const cluster = await prisma.clusters.findMany({
      orderBy: {
        clusterId: "desc",
      },
    });
    if (cluster) return cluster;
    return false;
  } catch (error) {
    console.log(error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};

export const deleteCluster = async (id: string) => {
  try {
    const deleteData = await prisma.clusters.delete({
      where: {
        clusterId: parseInt(id),
      },
    });
    if (!deleteData) return false;
    return true;
  } catch (error) {
    console.log(error);
    return json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
};
