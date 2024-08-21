import type { RoundStartResponse } from '$lib/snake/types';

export const demoResult: RoundStartResponse = {
	result: {
		outcome: {
			success: [
				{
					apple: {
						x: 8,
						y: 4
					},
					duration: 30,
					snakes: [
						{
							id: 'Red-0',
							segments: [
								{
									direction: 'up',
									length: 1,
									start: {
										x: 1,
										y: 9
									}
								}
							],
							team: {
								name: 'Red',
								score: 0
							}
						},
						{
							id: 'Red-1',
							segments: [
								{
									direction: 'up',
									length: 1,
									start: {
										x: 3,
										y: 0
									}
								}
							],
							team: {
								name: 'Red',
								score: 0
							}
						},
						{
							id: 'Blue-0',
							segments: [
								{
									direction: 'up',
									length: 1,
									start: {
										x: 2,
										y: 9
									}
								}
							],
							team: {
								name: 'Blue',
								score: 0
							}
						},
						{
							id: 'Blue-1',
							segments: [
								{
									direction: 'up',
									length: 1,
									start: {
										x: 5,
										y: 3
									}
								}
							],
							team: {
								name: 'Blue',
								score: 0
							}
						}
					],
					teams: [
						{
							name: 'Red',
							score: 0
						},
						{
							name: 'Blue',
							score: 0
						}
					]
				}
			]
		}
	}
};
