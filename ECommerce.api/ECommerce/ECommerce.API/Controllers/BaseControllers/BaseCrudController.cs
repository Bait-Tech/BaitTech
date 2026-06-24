using ECommerce.Services.Services.BaseServices.CrudServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers.BaseControllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BaseCrudController<T> : ControllerBase where T : class
    {
        protected readonly ICrudService<T> _service;

        protected BaseCrudController(ICrudService<T> service)
        {
            _service = service;
        }

        [HttpGet]
        public virtual async Task<ActionResult<IEnumerable<T>>> GetAll()
        {
            var entities = await _service.GetAllAsync();
            return Ok(entities);
        }

        [HttpGet("{id}")]
        public virtual async Task<ActionResult<T>> GetById(int id)
        {
            var entity = await _service.GetByIdAsync(id);
            if (entity == null)
            {
                return NotFound();
            }
            return Ok(entity);
        }

        [HttpPost]
        public virtual async Task<ActionResult> Create(T entity)
        {
            await _service.AddAsync(entity);
            return CreatedAtAction(nameof(GetById), new { id = entity.GetType().GetProperty("Id").GetValue(entity) }, entity);
        }

        [HttpPut("{id}")]
        public virtual async Task<ActionResult> Update(int id, T entity)
        {
            if (id != (int)entity.GetType().GetProperty("Id").GetValue(entity))
            {
                return BadRequest();
            }
            await _service.UpdateAsync(entity);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public virtual async Task<ActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}
