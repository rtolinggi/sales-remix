import { prisma } from "../utils/prisma.server";
import { json } from "@remix-run/node";

type PropsSubCluster = {
  clusterId: number;
  subClusterName: string;
};
export const createSubCluster = async (data: PropsSubCluster) => {
  try {
    const insertSubCluster = await prisma.sub_clusters.create({
      data,
    });
    if (insertSubCluster) return true;
    return false;
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

export const getSubCluster = async () => {
  try {
    const subCluster = await prisma.sub_clusters.findMany();
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
      include: {
        sub_clusters: true,
      },
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
    if (deleteData) return true;
    return false;
  } catch (error) {
    console.log(error);
    return json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
};
