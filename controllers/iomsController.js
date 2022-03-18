import express from 'express';
import { StatusCodes } from 'http-status-codes';

StatusCodes;
express;

const getAllEntries = async (req, res) => {
  res.send('Get all entries TO DASHBOARD');
};

export { getAllEntries };
