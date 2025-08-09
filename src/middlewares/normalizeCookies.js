// normalizeCookies.js - ensures consistent cookie casing/structure

module.exports = function normalizeCookies(req, res, next) {
  try {
    const c = req.cookies || {};

    const empId = c.EmpID || c.empid || c.empId || c.EMPID || c.EID || c.eid;

    const ctx = c.Context || c.context || {};
    const companyId = (ctx && (ctx.CompanyID || ctx.companyid || ctx.companyId)) || c.CompanyID || c.companyid || c.companyId;

    // Normalize EmpID
    if (empId) {
      if (!c.EmpID) req.cookies.EmpID = empId;
      if (!c.empid) req.cookies.empid = empId;
    }

    // Normalize Context.CompanyID variants
    if (companyId) {
      // Flat cookie for convenience
      if (!c.CompanyID) req.cookies.CompanyID = companyId;
      if (!c.companyid) req.cookies.companyid = companyId;

      // Ensure both Context/context objects exist
      if (!c.Context) req.cookies.Context = {};
      if (!c.context) req.cookies.context = {};

      if (!req.cookies.Context.CompanyID) req.cookies.Context.CompanyID = companyId;
      if (!req.cookies.context.CompanyID) req.cookies.context.CompanyID = companyId;
      if (!req.cookies.context.companyid) req.cookies.context.companyid = companyId;
    }
  } catch (e) {
    // Non-blocking; proceed even if normalization fails
  }
  return next();
};
