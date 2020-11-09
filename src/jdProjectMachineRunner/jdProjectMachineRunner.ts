// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { interpret } from "xstate";

// === Internal logic   ===-===-===-===-===-===-===-===-===-===-===-===-===-===
import jdProjectMachine from "../machines/jdProject.machine";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import JDProject from "../@types/JDProject";
import sortUserbaseData from "../userbase/sortUserbaseData";

/**
 * # jdProjectMachineRunner
 *
 * This function takes a `:JDProject` and tells you if it's valid or not.
 * It does this by running it through `jdProject.machine`.
 *
 * The inputs are simple.
 * @param {Object} jdProject The `:JDProject`-like object to test.
 *
 * Note that this does *not* specify that the input object should be sorted. We
 * assume that it is not, and sort it here (because the parser requries it to
 * be). Of course if we sort something that's already sorted we lose nothing
 * but CPU cycles.
 *
 * What should it return? It's got to be an object if you want it to be
 * consistent, and you've already got the `status` property on a `:JDProject`
 * so let's use it eh?
 *
 * So does that mean we just return a `:JDProject`? Yep. Easy.
 * @returns {Object} A `:JDProject`-like object.
 *
 * Let's be a good little functional programmer and not mutate the original.
 */

const jdProjectMachineRunner = (jdProject: Readonly<JDProject>): JDProject => {
	// Initiate the machine
	// TODO: Fix this TS-override one day.
	// @ts-expect-error
	const jdProjectMachineService = interpret(jdProjectMachine).start();

	// Set up a copy of the input
	let jdProjectCopy: JDProject = JSON.parse(JSON.stringify(jdProject));
	jdProjectCopy.status = "tbc";
	// We assume the input is unsorted - the machine needs it to be sorted
	jdProjectCopy.data = sortUserbaseData(jdProjectCopy.data);

	// Run each item through the machine
	const jdProjectLength = jdProjectCopy.data.length;
	for (let i = 0; i < jdProjectLength; i++) {
		// We use the jdType as our machine transition, so we uppercase it
		const jdTypeUpperCase = jdProjectCopy.data[i].item.jdType.toUpperCase();
		// Send it to the machine
		jdProjectMachineService.send({
			type: jdTypeUpperCase,
			...jdProjectCopy.data[i].item,
		});

		// If we're in an error state, we can save time and break
		if (jdProjectMachineService.state.matches("error")) {
			jdProjectCopy.status = "error";
			jdProjectCopy.error = jdProjectMachineService.state.context.error;
			jdProjectCopy.errorItem = jdProjectCopy.data[i];
			break;
		}
		// There was no error - loop until done
	}

	// If we're *not* in an error condition, send an EOF. (Checking first just
	// prevents console warnings that we're already in a 'final' state.)
	// This isn't really necessary, it's just neat.
	if (!jdProjectMachineService.state.matches("error")) {
		jdProjectMachineService.send({
			type: "EOF",
		});
	}

	// And therefore if we're in a valid EOF state, the input must have been good.
	// Flip our project's status accordingly. (There's no need to do anything
	// otherwise, as it's already been set to 'error' above.)
	if (jdProjectMachineService.state.matches("eof")) {
		jdProjectCopy.status = "valid";
	}
	return jdProjectCopy;
};

export default jdProjectMachineRunner;
