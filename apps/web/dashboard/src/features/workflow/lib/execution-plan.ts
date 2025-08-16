import { getIncomers, type Edge } from "@xyflow/react";

import type {
  AppNode,
  AppNodeMissingInput,
} from "@/features/workflow/types/app-node";

import {
  FLOW_TO_EXECUTION_PLAN_VALIDATION_ERROR,
  type IFlowToExecutionPlanValidationError,
  type IWorkflowExecutionPlan,
  type IWorkflowExecutionPlanPhase,
} from "@/features/workflow/types/workflow";

import { TaskRegistry } from "@/features/workflow/components/registry/task/registery";

export type IExecutionErrorType = {
  type: IFlowToExecutionPlanValidationError;
  invalidElements?: AppNodeMissingInput[];
};

type FlowToExecutionPlanType = {
  executionPlan?: IWorkflowExecutionPlan;
  error?: IExecutionErrorType;
};

export function FlowToExecutionPlan(
  nodes: AppNode[],
  edges: Edge[],
): FlowToExecutionPlanType {
  const entryPoint = nodes.find(
    (node) => TaskRegistry[node.data.type].isEntryPoint,
  );

  if (!entryPoint) {
    return {
      error: {
        type: FLOW_TO_EXECUTION_PLAN_VALIDATION_ERROR.NO_ENTRY_POINT,
      },
    };
  }

  const inputsWithErrors: AppNodeMissingInput[] = [];
  const planned = new Set<string>();

  const invalidInputs = getInvalidInputs(entryPoint, edges, planned);

  if (invalidInputs.length > 0) {
    inputsWithErrors.push({
      nodeId: entryPoint.id,
      inputs: invalidInputs,
    });
  }

  const executionPlan: IWorkflowExecutionPlan = [
    {
      phase: 1,
      nodes: [entryPoint],
    },
  ];

  planned.add(entryPoint.id);

  for (
    let phase = 2;
    phase <= nodes.length && planned.size < nodes.length;
    phase++
  ) {
    const nextPhase: IWorkflowExecutionPlanPhase = { phase, nodes: [] };

    for (const currentNode of nodes) {
      if (planned.has(currentNode.id)) {
        // node already put in execution plan
        continue;
      }

      const invalidInputs = getInvalidInputs(currentNode, edges, planned);

      if (invalidInputs.length > 0) {
        const incomers = getIncomers(currentNode, nodes, edges);

        if (incomers.every((incomer) => planned.has(incomer.id))) {
          // if all incoming incomers/edges are planned and there are still invalid inputs
          // this emans that this particular node has an invalid input
          // which meanstht the workflow is invalid
          console.log("INVALID INPUTS: ", currentNode.id, invalidInputs);

          inputsWithErrors.push({
            nodeId: currentNode.id,
            inputs: invalidInputs,
          });
        }

        // let's skip this node for now
        continue;
      }

      nextPhase.nodes.push(currentNode);
    }

    for (const node of nextPhase.nodes) {
      planned.add(node.id);
    }

    executionPlan.push(nextPhase);
  }

  if (inputsWithErrors.length > 0) {
    return {
      error: {
        type: FLOW_TO_EXECUTION_PLAN_VALIDATION_ERROR.INVALID_INPUTS,
        invalidElements: inputsWithErrors,
      },
    };
  }

  return { executionPlan };
}

function getInvalidInputs(node: AppNode, edges: Edge[], planned: Set<string>) {
  const invalidInputs = [];
  const inputs = TaskRegistry[node.data.type].inputs || [];

  for (const input of inputs) {
    const inputValue = node.data.inputs[input.name];
    const inputValueProvided = inputValue?.length > 0;

    if (inputValueProvided) {
      // this input is fine, we can move on
      continue;
    }

    // if a valueis not provided by the user then we need to check
    // if there is an output linked to the current input

    const incomingEdges = edges.filter((edg) => edg.target === node.id);

    const inputLinkedToOutput = incomingEdges.find(
      (edg) => edg.targetHandle === input.name,
    );

    const requiredInputProvidedByVisitedOutput =
      input.required &&
      inputLinkedToOutput &&
      planned.has(inputLinkedToOutput.source);

    if (requiredInputProvidedByVisitedOutput) {
      // the inputs is required and we have a valid value for it
      // prvided by a task that is already planned
      continue;
    }

    if (!input.required) {
      // if the input is not requird but there is an output linked to it
      // then we need to be sure that the output is already plnned

      if (!inputLinkedToOutput) continue;
      if (inputLinkedToOutput && planned.has(inputLinkedToOutput.source)) {
        // the output is providing a value to the input: the input is fine
        continue;
      }
    }

    invalidInputs.push(input.name);
  }

  return invalidInputs;
}
