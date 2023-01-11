import * as core from '@actions/core';
import * as fs from 'fs';
import mustache from 'mustache';
import {Config, PortainerConfig, StackConfig} from "./types";

function parsePortainerConfig(): PortainerConfig {
    return {
        url: new URL(core.getInput('portainer-url', {required: true})),
        username: core.getInput('portainer-username', {required: true}),
        password: core.getInput('portainer-password', {required: true}),
        endpoint: parseInt(core.getInput('portainer-endpoint', {required: true})),
        external: Boolean(JSON.parse(core.getInput('portainer-external', {required: true})))
    };
}

function parseStackConfig(): StackConfig {
    const filePath = core.getInput('file', {required: false});
    let file = fs.readFileSync(filePath, 'utf-8');

    core.debug(`File before mustache: ${file}`);

    if (filePath.split('.').pop() === 'mustache') {
        mustache.escape = JSON.stringify;
        file = mustache.render(file, JSON.parse(core.getInput('variables', {required: false})));
    }

    core.debug(`File after mustache: ${file}`);

    return {
        name: core.getInput('name', {required: true}),
        file,
        delete: !!core.getInput('delete', {required: false}).length,
        prune: !!core.getInput('prune', {required: false}).length
    };
}

export function parse(): Config {
    return {
        portainer: parsePortainerConfig(),
        stack: parseStackConfig()
    };
}
